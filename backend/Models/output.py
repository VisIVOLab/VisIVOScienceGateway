from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Output(Base):
    __tablename__ = "outputs"

    id = Column(String(64), primary_key=True)  # hash SHA256

    original_name = Column(String(255), nullable=False)

    path = Column(String(1024), nullable=False)

    # stesso discorso per file_type
    file_type_id = Column(Integer, ForeignKey("file_types.id", ondelete="SET NULL"))
    file_type = relationship("FileType", back_populates="outputs")

    run_id = Column(String(255), ForeignKey("runs.id", ondelete="CASCADE"))
    run = relationship("Run", back_populates="outputs")
