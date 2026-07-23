from pydantic import BaseModel, ConfigDict, Field

class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)