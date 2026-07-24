from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.project import router as pro_router
import app.models

app = FastAPI()

app.include_router(auth_router)
app.include_router(pro_router)