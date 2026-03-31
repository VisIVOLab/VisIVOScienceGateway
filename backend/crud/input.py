from sqlalchemy.orm import Session
from Models.input import Input 
from Models.file_type import FileType

import os


def create_input(db: Session, input_data):
    input_ = Input(**input_data)
    db.add(input_)
    db.commit()
    db.refresh(input_)
    return input_


def list_user_input_by_run(db: Session,run_id:str):
    return db.query(Input).join(FileType).filter(Input.run_id == run_id).all()

def get_configuration_file_by_run(db:Session, run_id:str):
    return db.query(Input).join(FileType).filter(Input.run_id == run_id,FileType.id ==2).first()


def list_all_inputs(db: Session):
    return db.query(Input).all()


def get_input(db: Session,input_id:str):
    return db.query(Input).filter(Input.id == input_id).first()


