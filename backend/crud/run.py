from sqlalchemy.orm import Session
from Models.upload import Upload
from Models.file_type import FileType
from Models.run import Run
from sqlalchemy import desc
import os


def create_run(db: Session, run_data):
    run = Run(**run_data)
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

def get_run(db: Session, run_id:str):
    return db.query(Run).filter(Run.id == run_id).first()


def get_user_runs(db: Session, owner:str):
    return db.query(Run).filter(Run.owner == owner).order_by(Run.schedule_at.desc()).all()


def update_run_status(db: Session, run_id:str, status=str):
    
    db_run = db.query(Run).filter(Run.id == run_id).first()

    if not db_run:
        return None

    if status in ["PENDING","RUNNING","COMPLETED","FAILED"]:
        db_run.status = status
    else:
        return None
   
    db.commit()
    
    db.refresh(db_run)

    return db_run



def delete_run_by_id(db: Session , run_id: str):
    run = db.query(Run).filter(Run.id == run_id).first()

    if not run:
        return {"error": "Run non trovata"}

    files_to_delete = []

    if run.outputs: 
            for output in run.outputs:
                if output.path:
                    files_to_delete.append(output.path)
    if run.inputs:
            for inp in run.inputs:
                if inp.path:
                    files_to_delete.append(inp.path)
    
    count_files = 0
    for path in files_to_delete:
        try:
            if os.path.exists(path):
                os.remove(path)
                count_files += 1
        except Exception as e:
            print(f"[WARNING] Errore eliminando file {path}: {e}")

    try:
        db.query(Run).filter(Run.id == run_id).delete()
        db.commit()
        return {"message": f"Run eliminato. Rimossi {count_files} file dal disco."}
        
    except Exception as e:
        db.rollback()
        print(f"Errore DB: {e}")
        return {"error": str(e)}        




def delete_all_runs(db:Session):
    runs = db.query(Run).all() 

    if not runs:
        return {"message": "Nessuna run da cancellare"}

   
    files_to_delete = []
    
    for run in runs:
       
        if run.outputs: 
            for output in run.outputs:
                if output.path:
                    files_to_delete.append(output.path)
        if run.inputs:
            for inp in run.inputs:
                if inp.path:
                    files_to_delete.append(inp.path)

 
    count_files = 0
    for path in files_to_delete:
        try:
            if os.path.exists(path):
                os.remove(path)
                count_files += 1
        except Exception as e:
            print(f"[WARNING] Errore eliminando file {path}: {e}")
    
 
    try:
        db.query(Run).delete()
        db.commit()
        return {"message": f"Tutte le run eliminate. Rimossi {count_files} file dal disco."}
        
    except Exception as e:
        db.rollback()
        print(f"Errore DB: {e}")
        return {"error": str(e)}