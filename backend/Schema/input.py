from pydantic import BaseModel
from typing import Optional
from Schema.file_type import FileTypeBase

class InputBase(BaseModel):
    id: str
    run_id: str
    path: str
    original_name: str
    file_type_id: int

class InputCreate(InputBase):
    pass

class InputRead(InputBase):
    class Config:
        orm_mode = True

class InputResponse(InputBase):
    file_type: Optional[FileTypeBase] = None  # modello annidato

    class Config:
        orm_mode = True
