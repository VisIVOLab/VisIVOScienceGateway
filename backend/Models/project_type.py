import datetime
import hashlib
import os
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class ProjectType(Base):
    __tablename__ = "project_types"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)  # esempio: Advance,PyAETNA

    projects = relationship("Project", back_populates="project_type")

    