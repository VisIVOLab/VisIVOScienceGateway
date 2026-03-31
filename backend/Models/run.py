from .base import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
class Run(Base):
    __tablename__ = "runs"

    id = Column(String(255), primary_key=True)         # task_id celery o uuid
    owner = Column(String(36), nullable=False)        # uuid Keycloak
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))

    schedule_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    #con server default quelli vecchi al posto di null hanno unknonw
    status = Column(String, nullable=False, server_default="UNKNOWN", default="PENDING")
    project = relationship("Project", back_populates="runs")
    outputs = relationship("Output", back_populates="run")
    inputs = relationship("Input", back_populates="run")

