from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from Schema.output import OutputResponse 

from pydantic import Field


class RunBase(BaseModel):
    id: str
    owner: str
    project_id: int
    status: str

class RunCreate(RunBase):
    id: str
    owner: str
    project_id: int
    status: str

    status: str = "PENDING"
   

class RunRead(RunBase):
    class Config:
        orm_mode = True

class RunResponse(RunBase):
    outputs: Optional[List[OutputResponse]] = Field(default_factory=list)

    class Config:
        orm_mode = True
