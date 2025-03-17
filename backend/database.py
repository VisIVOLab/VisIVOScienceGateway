from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Fetch database URL from environment variables
DATABASE_URL = os.getenv("AIRFLOW__DATABASE__SQL_ALCHEMY_CONN", "")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Define the Base for ORM models
Base = declarative_base()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()