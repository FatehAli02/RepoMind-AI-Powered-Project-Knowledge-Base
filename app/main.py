from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.project import router as pro_router
from app.routers.document import router as doc_router
from app.routers.query import router as query_router
import app.models

app = FastAPI(title="RepoMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pro_router)
app.include_router(doc_router)
app.include_router(query_router)
