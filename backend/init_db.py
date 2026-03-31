from database import engine, SessionLocal
from Models.base import Base
from Models.upload import Upload
from Models.file_type import FileType
from Models.project import Project
from Models.run import Run
from Models.project_type import ProjectType
from Models.output import Output
from sqlalchemy.orm import Session

# 1. crea le tabelle
Base.metadata.create_all(bind=engine)
print("Tabelle create correttamente!")

def init_project_types(db: Session):
    project_types= [
        {"id":1, "name": "classic"},
        {"id":2, "name": "PyAETNA"}
    ]

    for pt in project_types:
        existing=db.query(ProjectType).filter_by(id=pt["id"]).first()
        if not existing:
            db.add(ProjectType(**pt))
    db.commit()
    print("Tipi di progetti inizializzati")

# 2. inizializza i file type
def init_file_types(db: Session):
    file_types = [
        {"id": 1, "name": "cwl"},
        {"id": 2, "name": "yaml"},
        {"id": 3, "name": "input"},
        {"id": 4, "name": "run/yml"},
        {"id": 5, "name": "internal_log"},
        {"id": 6, "name": "output"}
    ]
    for ft in file_types:
        existing = db.query(FileType).filter_by(id=ft["id"]).first()
        if not existing:
            db.add(FileType(**ft))
    db.commit()
    print("File types inizializzati.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_file_types(db)
        init_project_types(db)
    finally:
        db.close()
