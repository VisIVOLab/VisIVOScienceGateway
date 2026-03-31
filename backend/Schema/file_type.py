from pydantic import BaseModel,ConfigDict
# Nota: 'from_attributes=True' è necessario in Pydantic v2 per mappare gli ORM.

from pydantic import BaseModel, ConfigDict

class FileTypeBase(BaseModel):
    name: str 
    
    # Lascia solo la configurazione V2
    model_config = ConfigDict(from_attributes=True)