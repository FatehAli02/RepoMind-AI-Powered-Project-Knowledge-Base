from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from groq import Groq

from app.models.user import User
from app.models.project import Project
from app.models.document import Document
from app.models.chunk import Chunk
from app.models.query import Query
from app.schemas.query import QueryRequest, QueryResponse
from app.core.config import settings
from app.database import get_db
from app.routers.deps import get_current_user
from app.core.embeddings import generate_embedding

router = APIRouter(prefix="/projects", tags=["Questions"])

groq_client = Groq(api_key=settings.groq_api_key)

@router.post("/{project_id}/ask", response_model=QueryResponse)
async def ask_question(
    project_id: int,
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
        ).first():

        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")

    question_vector = generate_embedding(request.question)

    relevant_chunks = db.query(Chunk).join(Document).filter(Document.project_id == project_id).order_by(Chunk.embedding.cosine_distance(question_vector)).limit(4).all()

    sources_list = [
    {"filename": chunk.document.title, "snippet": chunk.content[:200]}
    for chunk in relevant_chunks
]

    if not relevant_chunks:
        answer = "I don't have enough information to answer that. Please upload some documents first."

    else:
        content_text = "\n\n".join([chunk.content for chunk in relevant_chunks])

        system_prompt = f"""You are RepoMind, an expert senior developer and AI assistant. 
Your job is to answer questions about a specific codebase based ONLY on the context provided below.

STRICT RULES:
1. Use ONLY the provided context to answer the question. 
2. If the answer cannot be found in the context, do not guess. Say exactly: "I don't have enough information in the provided files to answer that."
3. Format your response beautifully using Markdown. 
4. If you write code, always wrap it in proper markdown code blocks with the language specified (e.g., ```python).
5. Be concise and explain the logic clearly.

Context:
{content_text}"""

        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role" : "system",
                    "content": system_prompt},
                    {"role" : "user",
                    "content" : request.question}
                ],
                model="llama-3.1-8b-instant"
            )
            answer = chat_completion.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

    new_query = Query(
        project_id= project_id,
        question= request.question,
        answer= answer,
        sources=sources_list
    )

    try: 
        db.add(new_query)
        db.commit()
        db.refresh(new_query)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

    return new_query

@router.get("/{project_id}/history", response_model=list[QueryResponse])
async def get_query_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    history = db.query(Query).filter(Query.project_id == project_id).all()

    return history