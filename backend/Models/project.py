from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base
import datetime


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True,autoincrement=True)
    name = Column(String(255), nullable=False) #nome del progetto
   
    owner = Column(String(36), nullable=False) #id keykloak

    uploads = relationship("Upload", back_populates="project", cascade="all, delete-orphan")

    runs = relationship("Run", back_populates="project")

    project_type_id = Column(Integer, ForeignKey("project_types.id", ondelete="SET NULL")) 
    project_type = relationship("ProjectType",back_populates="projects")