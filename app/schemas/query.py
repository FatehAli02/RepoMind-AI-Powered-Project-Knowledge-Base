from pydantic import BaseModel, ConfigDict

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    id: int
    project_id: int
    question: str
    answer: str

    model_config = ConfigDict(from_attributes=True)