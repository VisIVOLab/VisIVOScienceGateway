from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base
import datetime


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(String(64), primary_key=True)  # hash SHA256
    
    original_name = Column(String(255), nullable=False) #nome che ha messo l'utente in caricamento cosi lo riconosce
    
    path = Column(String(1024), nullable=False)  # path sul filesystem
    
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    owner = Column(String(36), nullable=False) #id keykloak


    # Chiave esterna per il tipo di file
    file_type_id = Column(Integer, ForeignKey("file_types.id", ondelete="SET NULL"))
    file_type = relationship("FileType", back_populates="uploads")

    # Chiave esterna per il progetto
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))  # Assumendo esista tabella projects
    project = relationship("Project", back_populates="uploads")
