# schemas/project.py
from pydantic import BaseModel
from typing import List, Optional
from Schema.project_type import ProjectTypeRead
class ProjectCreate(BaseModel):
    name: str
    owner: str
    project_type_id: Optional[int] = None # L'utente invia l'ID numerico
    
class ProjectRead(ProjectCreate):
    id: int
    
    project_type_id: Optional[int] = None

    # opzionale: puoi includere gli upload associati se vuoi leggere anche quelli
    uploads: Optional[List] = []
    project_type: Optional[ProjectTypeRead] = None
    class Config:
        orm_mode = True
