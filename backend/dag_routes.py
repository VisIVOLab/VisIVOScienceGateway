from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from keycloak_auth import get_current_user
from models import UserDag
import os
import shutil
import uuid

router = APIRouter()

DAGS_FOLDER = "/opt/airflow/dags"  # Ensure this path is correct for Airflow DAG storage

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

        # Save the file in the DAGs folder
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Register DAG in the database
        dag_entry = UserDag(user_id=user["sub"], dag_id=new_filename)
        db.add(dag_entry)
        db.commit()

        return {"message": "File uploaded successfully", "filename": new_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading DAG: {str(e)}")