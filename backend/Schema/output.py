from pydantic import BaseModel
from typing import Optional
from Schema.file_type import FileTypeBase

class OutputBase(BaseModel):
    id: str
    run_id: str
    path: str
    original_name: str
    file_type_id: int

class OutputCreate(OutputBase):
    pass

class OutputRead(OutputBase):
    class Config:
        orm_mode = True

class OutputResponse(OutputBase):
    file_type: Optional[FileTypeBase] = None  # modello annidato

    class Config:
        orm_mode = True
