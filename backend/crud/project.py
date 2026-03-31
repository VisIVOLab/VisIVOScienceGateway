from sqlalchemy.orm import Session,joinedload
from Models.project import Project
from Models.upload import Upload
from Models.file_type import FileType
from Models.project_type import ProjectType
import os

def create_project(db: Session, project_data) -> Project:
    project = Project(**project_data)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_project(db: Session, project_id: int) -> Project:
    return db.query(Project).filter(Project.id == project_id).first()

def get_project_type(db: Session,project_id: int):
    query= db.query(Project).filter(Project.id == project_id).first()
    return query.project_type_id if query else None

def list_user_projects(db: Session, owner:str ):
    return db.query(Project).options(joinedload(Project.project_type)).filter(Project.owner == owner).all()

def delete_user_project(db: Session, project_id:int ,owner: str):
    project = db.query(Project).filter(Project.id == project_id,Project.owner == owner).first() #fa un && deve esistere l'id ma deve appartenere a chi fa la query

    if not project:
        return None  

    db.delete(project)
    db.commit()

    file_paths = [f.path for f in project.uploads]
    for path in file_paths:
        try:
            os.remove(path)
        except FileNotFoundError:
            # il file non esiste più, puoi loggare
            pass
        except Exception as e:
            # logga l'errore, ma non fallire necessariamente tutto
            print(f"Errore eliminando file {path}: {e}")


  

    return project

def is_owner(db:Session,project_id,owner:str):
    
    project = db.query(Project).filter(Project.id == project_id,Project.owner == owner).first() 
    if not project:
        return False
    else:
        return True


def get_run_file(db: Session, project_id: str):
    return db.query(Upload).join(Project).join(FileType).filter(Project.id == project_id, FileType.id == 4).first()