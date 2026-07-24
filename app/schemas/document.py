from pydantic import BaseModel, ConfigDict

class DocumentResponse(BaseModel):
    id: int
    project_id: int
    title: str
    content: str

    model_config = ConfigDict(from_attributes=True)
