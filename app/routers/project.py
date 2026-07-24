from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    new_project = Project(
        name=project_in.name,
        user_id=current_user.id
    )
    try:
        db.add(new_project)
        db.commit()
        db.refresh(new_project)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

    return new_project


@router.get("/", response_model=list[ProjectResponse])
async def display_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    list_of_projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    return list_of_projects


@router.delete("/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    to_delete = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
        ).first()

    if to_delete is None:
        raise HTTPException(status_code=404, detail="Project Not Found")

    try:
        db.delete(to_delete)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"message": "Project deleted successfully"}
