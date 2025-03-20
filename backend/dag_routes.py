from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from keycloak_auth import get_current_user
from models import UserDag
import os
import shutil
import uuid
import re

router = APIRouter()

DAGS_FOLDER = "/opt/airflow/dags"  # Ensure this path is correct for Airflow DAG storage

@router.delete("/delete/{dag_id}")
async def delete_dag(dag_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete a DAG file if the authenticated user is the owner.
    """
    # Check if the DAG belongs to the user
    user_dag = db.query(UserDag).filter(UserDag.user_id == user["sub"], UserDag.dag_id == dag_id).first()

    if not user_dag:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this DAG or it does not exist.")

    # Construct the file path
    dag_path = os.path.join(DAGS_FOLDER, dag_id)

    try:
        # Remove the file if it exists
        if os.path.exists(dag_path):
            os.remove(dag_path)

        # Remove the DAG entry from the database
        db.delete(user_dag)
        db.commit()

        return {"message": "DAG deleted successfully", "dag_id": dag_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting DAG: {str(e)}")
    

@router.get("/list")
async def list_user_dags(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves all DAGs uploaded by the authenticated user.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    dags = db.query(UserDag).filter(UserDag.user_id == user_id).all()
    if not dags:
        return {"message": "No DAGs found for the user"}
    
    return {"dags": [{"dag_id": dag.dag_id, "created_at": dag.created_at} for dag in dags]}

def modify_dag_content(file_content: str, new_dag_id: str, user_id: str) -> str:
    """
    Modifica il contenuto del file Python per assegnare un dag_id e owner univoco.
    """
    print (f"inside {user_id}")
    file_content = re.sub(r'dag_id\s*=\s*[\'\"](.+?)[\'\"]', f'dag_id="{new_dag_id}"', file_content, count=1)    
    file_content = re.sub(r'"owner"\s*:\s*"(.+?)"', f'"owner": "{user_id}"', file_content, count=1)

    return file_content
@router.post("/upload/")
async def upload_dag(file: UploadFile = File(...), db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """
    Handles DAG file upload and stores it in the DAGs directory with a unique name.
    """
    try:
        original_filename = file.filename
        unique_suffix = uuid.uuid4().hex[:6]  # Generate a short unique identifier
        new_filename = f"{original_filename.rsplit('.', 1)[0]}_{unique_suffix}.py"
        file_path = os.path.join(DAGS_FOLDER, new_filename)

        file_content = file.file.read().decode("utf-8")
    
        updated_content = modify_dag_content(file_content, new_filename, user.get("preferred_username"))
    
        with open(file_path, "w", encoding="utf-8") as buffer:
            buffer.write(updated_content)

        # Register DAG in the database
        dag_entry = UserDag(user_id=user["sub"], dag_id=new_filename)
        db.add(dag_entry)
        db.commit()

        return {"message": "File uploaded successfully", "filename": new_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading DAG: {str(e)}")