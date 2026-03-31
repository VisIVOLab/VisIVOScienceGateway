from pydantic import BaseModel
from datetime import datetime
from Schema.file_type import FileTypeBase

class UploadCreate(BaseModel):
    id: str
    owner: str
    original_name: str
    path: str
    file_type_id: int
    project_id: int

class UploadRead(UploadCreate):
    id: str
    uploaded_at: datetime

    class Config:
        orm_mode = True


class UploadResponse(BaseModel):
    id: str
    project_id: int
    owner: str
    original_name:str
    uploaded_at: datetime
    # Importante: usa il nome della relazione ORM ('file_type') e il modello annidato
    file_type: FileTypeBase 
    
    class Config: # Pydantic v1
        orm_mode = True
        
   