from sqlalchemy.orm import Session
from Models.upload import Upload
from Models.file_type import FileType
import os
def create_upload(db: Session, upload_data):
    upload = Upload(**upload_data)
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


def list_uploads(db: Session):
    return db.query(Upload).all()


def list_user_uploads_by_project(db: Session, project_id: int,owner:str):
    return db.query(Upload).join(FileType).filter(Upload.project_id == project_id,Upload.owner == owner).all()

def get_cwl_files_by_project(db:Session,project_id:int,owner:str):
    return db.query(Upload).join(FileType).filter(Upload.project_id == project_id,Upload.owner == owner,FileType.id == 1).all()


def get_upload_by_id(db: Session, file_id: str):
        return db.query(Upload).filter(Upload.id == file_id).first()

def delete_user_upload(db: Session, upload_id:str ,owner: str):
    upload = db.query(Upload).filter(Upload.id == upload_id,Upload.owner == owner).first() 

    if not upload:
        return None  

    db.delete(upload)
    db.commit()

    file_path =upload.path


    try:
        print(file_path)
        os.remove(file_path)
    except FileNotFoundError:
        pass
    except Exception as e:
            
        print(f"Errore eliminando file {file_path}: {e}")


  

    return upload