from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class UserDag(Base):
    """ORM model representing the association between users and DAGs."""
    
    __tablename__ = "user_dags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), nullable=False, index=True)
    dag_id = Column(String(255), nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    __table_args__ = ({"sqlite_autoincrement": True},)