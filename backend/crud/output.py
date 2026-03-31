from sqlalchemy.orm import Session
from Models.output import Output
from Models.file_type import FileType

import os


def create_output(db: Session, output_data):
    output = Output(**output_data)
    db.add(output)
    db.commit()
    db.refresh(output)
    return output


def list_user_outputs_by_run(db: Session,run_id:str):
    return db.query(Output).join(FileType).filter(Output.run_id == run_id).all()


def get_output(db: Session,output_id:str):
    return db.query(Output).filter(Output.id == output_id).first()
