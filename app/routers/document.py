from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.document import Document
from app.models.chunk import Chunk
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.database import get_db
from app.routers.deps import get_current_user
from app.core.chunking import chunk_text
from app.core.embeddings import generate_embedding

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/uploads/{project_id}", response_model=DocumentResponse)
async def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
        ).first():
        raise HTTPException(status_code=400, detail="Project not exists")

    content = await file.read()

    text_content = content.decode("utf-8")

    new_doc = Document(
        project_id= project_id,
        title= file.filename,
        content= text_content
    )

    try:
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

    chunks = chunk_text(text_content)

    for chunk in chunks:
        vector = generate_embedding(chunk)
        new_chunk = Chunk(
            document_id= new_doc.id,
            content= chunk,
            embedding= vector 
        )
        db.add(new_chunk)

    db.commit()

    return new_doc

