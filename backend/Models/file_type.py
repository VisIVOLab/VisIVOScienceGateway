import datetime
import hashlib
import os
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class FileType(Base):
    __tablename__ = "file_types"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)  # esempio: 'cwl', 'yaml', 'input_data', 'configure'

    uploads = relationship("Upload", back_populates="file_type")
    outputs = relationship("Output", back_populates="file_type")
    inputs = relationship("Input",back_populates="file_type")
    