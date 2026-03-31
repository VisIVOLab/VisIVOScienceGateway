from pydantic import BaseModel,ConfigDict

class ProjectTypeRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True # In Pydantic v2 si usa questo al posto di orm_mode