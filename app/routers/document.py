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
from app.core.embeddings import generate_embedding_batch

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

    try:
        chunks = chunk_text(text_content)

        vectors = generate_embedding_batch(chunks)

        chunk_objects = [
            Chunk(document_id=new_doc.id, content=chunk, embedding=vector)
            for chunk, vector in zip(chunks, vectors)
        ]
        db.add_all(chunk_objects)

        db.commit()
    except HTTPException:
        db.delete(new_doc)
        db.commit()
        raise

    return new_doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    document = db.query(Document).join(Project, Document.project_id == Project.id).filter(
        Document.id == document_id,
        Project.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        db.query(Chunk).filter(Chunk.document_id == document_id).delete(synchronize_session=False)

        db.delete(document)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

    return None

@router.get("/project/{project_id}", response_model=list[DocumentResponse])
async def display_documents(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    if not db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first():
        raise HTTPException(status_code=404, detail="Project Not Found")
    list_of_documents = db.query(Document).filter(Document.project_id == project_id).all()

    return list_of_documents