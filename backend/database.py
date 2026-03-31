#serve per collegarsi al db postegres del backend


from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from Models.base import Base

import os
import sys

DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', '5432') # 5432 è il default
DB_TYPE = os.environ.get("DB_TYPE")
if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    print("ERRORE: Variabili d'ambiente del DB mancanti!")
    sys.exit(1)


# Fetch database URL from environment variables
DATABASE_URL = f"{DB_TYPE}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Define the Base for ORM models


# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
