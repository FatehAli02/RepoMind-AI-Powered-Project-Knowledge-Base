from pydantic import BaseModel, ConfigDict, field_validator

class QueryRequest(BaseModel):
    question: str

class SourceRef(BaseModel):
    filename: str
    snippet: str

class QueryResponse(BaseModel):
    id: int
    project_id: int
    question: str
    answer: str
    sources: list[SourceRef] = []
    @field_validator("sources", mode="before")
    @classmethod
    def default_sources(cls, v):
        return v or []

    model_config = ConfigDict(from_attributes=True)