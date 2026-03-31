from fastapi import APIRouter, HTTPException, Depends, Response,UploadFile,File,Form,WebSocket,WebSocketDisconnect
from fastapi.responses import FileResponse,JSONResponse
from pydantic import BaseModel
from keycloak_auth import get_current_user 
import requests
import os
from crud.project import list_user_projects
from crud.project import delete_user_project
from crud.project import create_project,get_run_file,get_project_type,get_project
from Schema.project import ProjectCreate
from crud.upload import create_upload
from crud.upload import list_user_uploads_by_project,get_upload_by_id,list_uploads,get_cwl_files_by_project
from crud.upload  import delete_user_upload
from Schema.upload import UploadCreate
from Schema.upload import UploadResponse
from crud.run import create_run
from crud.run import get_user_runs,get_run
from Schema.run import RunCreate
from Schema.run import RunRead
from Schema.run import RunResponse 
from Schema.output import OutputBase
from Schema.output import OutputRead
from Schema.output import OutputResponse
from crud.run import delete_all_runs,delete_run_by_id
from crud.output import list_user_outputs_by_run
from database import get_db
from sqlalchemy.orm import Session
import hashlib
import time
from typing import List
from pathlib import Path
import shutil
import tempfile
import subprocess
import time
import streamflow
from tasks import add #TEST TASK FOR CELERY 
from tasks import launch_streamflow
from celery.result import AsyncResult
from tasks import app as celery_app 
from crud.output import get_output
from Schema.input import InputCreate
from crud.input import create_input,list_all_inputs,get_configuration_file_by_run
import uuid
import yaml
import io
from typing import Dict, Any, Union


from cwltool.load_tool import resolve_and_validate_document
from cwltool.context import LoadingContext
from cwltool.process import get_schema
from cwltool.cwlviewer import CWLViewer
from schema_salad.ref_resolver import Loader, file_uri
from schema_salad.schema import load_schema


import redis.asyncio as redis 
#from cwltool.main import main
import cwltool.factory

import logging
import logstash

router = APIRouter()
REDIS_URL = "redis://redis:6379/0"

#logstash configuration 
host = 'logstash'

logger = logging.getLogger('python-logstash-logger')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.LogstashHandler(host, 5959, version=1))




#WEBSOCKET PER LEGGERE I LOGS
@router.websocket("/ws/logs/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await websocket.accept()
    
    # Creiamo una connessione Redis dedicata a questo socket
    r = redis.from_url(REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    
    # Ci iscriviamo al canale specifico definito nel worker Celery
    channel_name = f"logs:{run_id}"
    await pubsub.subscribe(channel_name)

    try:
        # Ascoltiamo i messaggi in loop
        async for message in pubsub.listen():
            # Redis manda anche messaggi di servizio (subscribe/unsubscribe), noi vogliamo solo i dati
            if message["type"] == "message":
                log_line = message["data"]
                # Inviamo la riga al frontend React
                await websocket.send_text(log_line)
                
    except WebSocketDisconnect:
        print(f"Client scollegato dal log {run_id}")
    except Exception as e:
        print(f"Errore WebSocket: {e}")
    finally:
        # Pulizia
        await pubsub.unsubscribe(channel_name)
        await r.close()

def get_user_info(user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    user_id = user.get("sub")  #id univoco di keykloak

    if not user_id:
        raise HTTPException(status_code=401, detail="ID not found!")

    return {"username": username, "user_id": user_id}

est_map = {
    "cwl": 1,
    "yml": 2,
    "input": 3,
    "run":4
}

#model per ricevere i parametri slurm
class SlurmData(BaseModel):
    accountSlurm: str
    nodi: int
    ntaskPerNode: int
    partition: str

@router.post("/slurmParam/{run_id}", description="Set SLURM parameters for a run")
async def set_slurm_params(run_id: str, slurm_data: SlurmData, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]

    print(f"Setting SLURM params for project {run_id} by user {username}: {slurm_data}")
    run_info = get_run(db,run_id)
    
    if not run_info:
        raise HTTPException(status_code=404, detail="Run non trovata")

    config_file = get_configuration_file_by_run(db,run_id)
    project_id = run_info.project_id
    cwl_files = get_cwl_files_by_project(db,project_id,user_id)
    logger.info(f"[SLURM PARAMS] Setting SLURM params for project {project_id} (RUN {run_id}) by user {username}: {slurm_data}")

    workflow_cwl_name = None
    for file in cwl_files:
        try:
            with open(file.path, 'r') as f:
                content = yaml.safe_load(f)
                #print(f"Contenuto del file CWL {file.original_name}: {content}")
                if content and content.get('class') == 'Workflow':
                    workflow_cwl_name = file.original_name
                    break
        except Exception as e:
            logger.error(f"Errore nella lettura del file CWL {file.path}: {e}")

    if not workflow_cwl_name:
        raise HTTPException(status_code=400, detail="Nessun file CWL di classe 'Workflow' trovato.")
        
    yaml_config = {
        "version": "v1.0",
        "workflows": {
            "test": {
                "type": "cwl",
                "config": {
                    "file": workflow_cwl_name,
                    "settings": config_file.original_name 
                },
                "bindings": [
                    {"step": "/"}
                ]
            }
        }
    }

    slurm_params = slurm_data.model_dump()
    workflow_config = yaml_config['workflows']['test']

    # Imposto il target nel binding
    workflow_config['bindings'][0]['target'] = {
        'deployment': 'cluster',
        'service': 'example'
    }

    cluster_user = os.getenv("CLUSTER_ACCOUNT", "default_user")
    cluster_ssh_key = os.getenv("SSH_KEY_PATH", "/path/to/default/key")
    cluster_ip = os.getenv("CLUSTER_IP", "default.cluster.ip")
    # Definisco i deployments
    yaml_config['deployments'] = {
        'cluster-ssh': {
            'type': 'ssh',
            'config': {
                'username': cluster_user,
                'sshKey': cluster_ssh_key,
                'nodes': [cluster_ip]
            }
        },
        'cluster': {
            'type': 'slurm',
            'wraps': 'cluster-ssh',
            'config': {
                'services': {
                    'example': {
                        'account': slurm_params['accountSlurm'],
                        'nodes': str(slurm_params['nodi']),
                        'ntasksPerNode': slurm_params['ntaskPerNode'],
                        'partition': slurm_params['partition']
                    }
                }
            },
            'workdir': '/mnt/beegfs/visivosg/scratch'
        }
    }

    base_dir = "/app/workflows/uploads"

    filename = "streamflow.yaml"
    path_obj = Path(filename)
    ext = "".join(path_obj.suffixes).lower()


    # Generazione Hash Univoco
    unique_string = f"{user_id}_{filename}_{time.time()}"
    hashing = hashlib.sha256(unique_string.encode('utf-8')).hexdigest()
    save_path = os.path.join(base_dir, f"{hashing}{ext}")

    # 5. Scrittura fisica del file
    try:
        with open(save_path, 'w') as f:
            yaml.safe_dump(yaml_config, f, sort_keys=False, indent=2)
        logger.info(f"File streamflow.yaml creato in: {save_path}")

    except Exception as e:
        logger.error(f"Errore creazione file: {e}")
        raise HTTPException(status_code=500, detail="Errore durante la creazione del file streamflow.yaml")

    try:
        upload_data = {
            "id": hashing,
            "original_name": filename,
            "path": save_path,
            "owner": user_id,
            "project_id": project_id,
            "file_type_id": 4
        }
        db_upload = create_upload(db, upload_data)

        
    except Exception as e:
        logger.error(f"Errore salvataggio DB: {e}")
        raise HTTPException(status_code=500, detail="Errore nel database durante il salvataggio del file")



    return {"status": "ok", "message": "SLURM parameters set successfully"}


@router.delete("/run/{run_id}",description="Delete a run by its ID and all associated data")
async def deleteRun(run_id:str, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):

    logger.info(f"[DELETE]Deleting run {run_id} from user {user_info['username']}")
    
    run = delete_run_by_id(db,run_id)
    if not run:
        return {"status":"err","message":"no run found!"}
    
    return {"status":"ok","messagge":"run deleted"}



@router.get("/cleanRUN",description="Delete all runs and associated data (for testing purposes)")
async def test_wf(user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):    
    
    logger.info('python-logstash: test logstash info message.')
    
    delete_all_runs(db)
    inp = list_all_inputs(db)
    print("INPUTS:")
    print(inp)

@router.get("/view/{file_id}", description="Returns the DOT representation of a CWL workflow for visualization")
async def test_graph(file_id: str,user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):    

    print(f"CON ID {file_id} ho trovato:.... ")
    logger.info(f"[CWL VIEWER] Generating graph for file {file_id} for user {user_info['username']}")   

    cwl = get_upload_by_id(db,file_id)
 
    try:
        
        command = ["cwltool", "--print-dot", cwl.path]
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True  
        )
        
        
        dot_string = result.stdout
        print(f"DOT = {dot_string} ")
        if not dot_string.strip().startswith("digraph"):
              raise HTTPException(
                     status_code=500, 
                     detail=f"internal server error (cwltool wrong output): {str(e)}")

        return dot_string
        
    except Exception as e:
        #  qualsiasi altro errore di lettura
        print(f"!!! ERROR  {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"internal server error: {str(e)}"
        )
   



@router.post("/upload",summary="Upload file",description="Upload a file to associate project")
async def uploadFile(file: UploadFile = File(...,description="File to upload"), category: str = Form(...,description="Category of file (run,cwl..)"),project_id:int = Form(...,description="Project ID"),user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)): 

    user_id = user_info["user_id"]
    username = user_info["username"]

    print(f"Ricevuto file {file.filename} file dall'utente: {username} - [id : {user_id}], file di tipo {category} per il project {project_id}")

    logger.info(f"[UPLOAD] User {username} is uploading file {file.filename} of type {category} for project {project_id}")
   
    uploads_dir = "/app/workflows/uploads"
    os.makedirs(uploads_dir, exist_ok=True)  # assicura che esista


   
    print(f"Processo: {file.filename}")
    
        
   
    path = Path(file.filename)
    suffixes = "".join(path.suffixes)
    name = path.stem  # il nome base senza suffissi multipli
    ext = suffixes.lower()

    unique_string = f"{user_id}_{file.filename}_{time.time()}"   #user id + nomefile + timestamp caricamento stringa univoca 
    hashing = hashlib.sha256(unique_string.encode('utf-8')).hexdigest()
    save_path = os.path.join(uploads_dir, f"{hashing}{ext}")
    file_type  = est_map.get(category)  #PRENDIAMO LA CATEGORIA CHE HA SCELTO l'user
        

    print(hashing)

    upload_data = UploadCreate(
        id = hashing,
        original_name=file.filename,
        path=save_path,
        owner=user_id,
        project_id= project_id,  
        file_type_id=file_type)

    # chiama la funzione CRUD
    db_upload = create_upload(db, upload_data.dict())
        
    
    with open(save_path, "wb") as f:
      f.write(await file.read())
    
  
    return {"status": "ok", "messagge": "file uploaded"}


@router.post("/config_type2",description="Create streamflow configuration file for guided project type and upload it")
async def crete_config( path: str = Form(...),run_id:str = Form(...),user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)): 

    user_id = user_info["user_id"]
    username = user_info["username"]

    print(f"Creating streamflow config for path {path} - run {run_id} by user {username}")

    data_to_save = {
    "conf": {
        "class": "File",
        "path": "config.yaml"
    },
    "data": {
        "class": "File",
        "path": path
    }
    }
    ext = ".yml"   
    uploads_dir = "/app/workflows/uploads"
    unique_string = f"{user_id}_{time.time()}"   #user id  + timestamp caricamento stringa univoca 
    hashing = hashlib.sha256(unique_string.encode('utf-8')).hexdigest()
    save_path = os.path.join(uploads_dir, f"{hashing}{ext}")

    input_data = InputCreate(
        id = hashing,
        original_name="streamflow_config.yaml",
        path=save_path,
        run_id=run_id,  
        file_type_id=2)

    # chiama la funzione CRUD
    db_upload = create_input(db, input_data.dict())
        

# Scrittura su file .yml
    try:
        with open(save_path, 'w') as file:
          yaml.safe_dump(data_to_save, file, sort_keys=False, indent=2, default_flow_style=False)
    except Exception as e:
        return {"error": f"Failed to write file: {str(e)}"}

    print(f"Streamflow configuration file created at {save_path} and associated with run {run_id} in the database.")
    return {"status": "success", "message": "Configuration file created and uploaded successfully"}
  


@router.post("/input/new",description="Upload an input file for a specific run")
async def new_input(file: UploadFile = File(...), category: str = Form(...),run_id:str = Form(...),user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)): 
   
   
    user_id = user_info["user_id"]
    username = user_info["username"]

    print(f"Ricevuto file {file.filename} file dall'utente: {username} - [run id : {run_id}], file di tipo {category}")

    logger.info(f"[INPUT UPLOAD] User {username} is uploading input file {file.filename} of type {category} for run {run_id}")
   
    uploads_dir = "/app/workflows/uploads"
    os.makedirs(uploads_dir, exist_ok=True)  # assicura che esista


   
    print(f"Processo: {file.filename}")
    
        
   
    path = Path(file.filename)
    suffixes = "".join(path.suffixes)
    name = path.stem  # il nome base senza suffissi multipli
    ext = suffixes.lower()

    unique_string = f"{user_id}_{file.filename}_{time.time()}"   #user id + nomefile + timestamp caricamento stringa univoca 
    hashing = hashlib.sha256(unique_string.encode('utf-8')).hexdigest()
    save_path = os.path.join(uploads_dir, f"{hashing}{ext}")
    file_type  = est_map.get(category)  #PRENDIAMO LA CATEGORIA CHE HA SCELTO l'user
        

    print(hashing)

    input_data = InputCreate(
        id = hashing,
        original_name=file.filename,
        path=save_path,
        run_id=run_id,  
        file_type_id=file_type)

    # chiama la funzione CRUD
    db_upload = create_input(db, input_data.dict())
        
    
    with open(save_path, "wb") as f:
      f.write(await file.read())
    
  
    return {"status": "ok", "messagge": "file uploaded"}


@router.get("/myProjects",description="Return all projects associated with the authenticated user")
async def myProject(user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]
    
    print(f"looking for {username} projects...")
    #logger.info(f"[PROJECT LIST] Listing projects for user {username}")
    projects = list_user_projects(db,user_id)

    print(projects)


    return {"status":"ok","projects":projects}




@router.delete("/project/{project_id}",description="Delete a project by its ID and all associated data")
async def delete_project(project_id: int, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]
    logger.info(f"[DELETE] Deleting project {project_id} for user {username}")
    deleted = delete_user_project(db, project_id,user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")


    return {"message": f"Project {project_id} deleted successfully"}



@router.get("/project/{project_id}",response_model=List[UploadResponse],description="Return all uploads associated with a specific project")
async def get_project_uploads(project_id: int, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):

    user_id = user_info["user_id"]
    username = user_info["username"]

    uploads = list_user_uploads_by_project(db,project_id,user_id)

    print(uploads)
    return uploads
    #return {"status":"ok", "uploads":uploads}
    
@router.get("/project_type/{project_id}",description="Return project type of a specific project")
async def get_project_type(project_id: int, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]

    prj =  get_project(db,project_id)

    prj_type = prj.project_type_id

    print(prj_type)
    return prj_type



#classe per leggere il nome del progetto che arriva dal json
class ProjectCreation(BaseModel):
    # Il nome del campo qui (project_name) deve corrispondere a quello inviato dal frontend
    project_name: str
    project_type : int 

@router.post("/newProject",description="Create a new project for the authenticated user")
async def newProject( requests:ProjectCreation,user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]

    print(f"creating project  {requests.project_name} for user {username} - type {requests.project_type}" )
    logger.info(f"[NEW PROJECT] Creating new project {requests.project_name} for user {username}- type {requests.project_type}")
    project_data = ProjectCreate( name=requests.project_name,owner=user_id,project_type_id = requests.project_type)

    db_project = create_project(db,project_data.dict())

    
    if requests.project_type == 2:

        hashing = hashlib.sha256(f"{user_id}_{requests.project_name}_{time.time()}".encode('utf-8')).hexdigest()
        #mappo al progetto un file già esistente
        upload_data = UploadCreate(
        id = hashing,
        original_name="pyAETNA.cwl",
        path="/app/workflows/projects/pyAETNA.cwl",
        owner=user_id,
        project_id= db_project.id,  
        file_type_id=1)
        db_upload = create_upload(db, upload_data.dict())



    return {"status":"ok", "messagge":"new project created"}

@router.delete("/upload/{upload_id}",description="Delete an upload by its ID")
async def delete_upload(upload_id: str, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]
    username = user_info["username"]
    logger.info(f"[DELETE] Deleting upload {upload_id} for user {username}")
    deleted = delete_user_upload(db, upload_id,user_id,)

    if not deleted:
        raise HTTPException(status_code=404, detail="file not found")


    return {"message": f"File {upload_id} deleted successfully"}



#classe per ricevere il project id
class newRunModel(BaseModel):
    project_id: int


@router.post("/newRun", description="Create a new run for a specific project")
async def new_run(data : newRunModel, user_info: dict = Depends(get_user_info), db: Session = Depends(get_db)):
    
    user_id = user_info["user_id"]

    uid = str(uuid.uuid4())
    logger.info(f"[NEW RUN] Creating new run {uid} for user {user_info['username']} in project {data.project_id}")
    run = RunCreate(id= uid, owner=user_id, project_id=data.project_id)
    create_run(db,run.dict())

    inputs ={}
    uploads = list_user_uploads_by_project(db,data.project_id,user_id)

    for upload in uploads:
        if upload.file_type.name == "cwl":
            with open(upload.path) as f:
                
                cwl_content = yaml.safe_load(f)
                if cwl_content.get('class') == 'Workflow':
                    if 'inputs' in cwl_content:
                        print("Ho trovato i seguenti input richiesti:")
                        inputs = cwl_content['inputs']
                        
                    
                        if isinstance(inputs, dict):
                            for nome_input, dettagli in inputs.items():
                            
                                tipo = dettagli if isinstance(dettagli, str) else dettagli.get('type')
                                print(f"- Input: '{nome_input}' (Tipo: {tipo})")

            
                    if 'steps' in cwl_content:
                        print(f"\nIl workflow è composto da {len(cwl_content['steps'])} passaggi: {list(cwl_content['steps'].keys())}")

    return {"inputs":inputs,"run_id":uid}


class SubmitModel(BaseModel):
    project_id: int
    run_id : str



@router.post("/submit",description="Submit a run for execution")
async def submit(data: SubmitModel, user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):

    user_id = user_info["user_id"]
    username = user_info["username"]
    logger.info(f"[SUBMIT] Submitting run {data.run_id} for user {username} in project {data.project_id}")
    print(f"Submit project {data.project_id}")
    uploads = list_user_uploads_by_project(db,data.project_id,user_id)

   # input_data = list_user_input_by_run(db,data.run_id)
    #result = launch_streamflow(uploads)
    print("[BACKEND][TEST FOR CELERY]")
    result = launch_streamflow.delay(data.project_id,data.run_id,user_id)

    
    

   
    

   
    return {
        "message": "Workflow avviato con successo!", 
        "details": "result"
    }

@router.get("/getRes/{task_id}",description="Get the status and result of a submitted task")
async def get_result(task_id: str, user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):
    

    delete_all_runs(db)
    user_id = user_info["user_id"]
    task_result = AsyncResult(task_id, app=celery_app)
    real_status = AsyncResult(task_id, app=celery_app).status
    print(f"provo a ottenere dati su {task_id}.... ")
    print(f"status: {task_result.status}")
    print(f"res: {task_result.result}")
    print(f"real: {real_status}")

    print("[TEST DB RUNS]")
    runs = get_user_runs(db,user_id)

    for run in runs:
        print(f"RUN ID: {run.id}")
        print(f"RUN OWNER:{run.owner}")
        print(f"PROJECT: {run.project_id}")
    return {
        "task_id": task_id,
        "status": task_result.status,  # PENDING, STARTED, SUCCESS, FAILURE
        "result": task_result.result   # None se non ancora completato
    }


@router.get("/myRuns",description="Return all runs associated with the authenticated user")
async def get_runs(user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):

    user_id = user_info["user_id"]

    runs = get_user_runs(db,user_id)

    return {"status":"ok","runs":runs}
    

@router.get("/run/{run_id}",response_model=List[OutputResponse],description="Return all outputs associated with a specific run")
async def get_outputs(run_id: str,user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):

    user_id = user_info["user_id"]

    outputs = list_user_outputs_by_run(db,run_id)

    return outputs

@router.get("/run_status/{run_id}", description="Get the status of a specific run")
async def get_status(run_id: str,user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):

    user_id = user_info["user_id"]

    run = get_run(db,run_id)
    if run:
        return run.status
    else:
        return None


@router.get("/output/{output_id}/download",description="Download a specific output file by its ID")
async def download_output(output_id:str, user_info:dict = Depends(get_user_info), db: Session= Depends(get_db)):

    output =get_output(db,output_id)

    return FileResponse(
        path=output.path, 
        filename=output.original_name, 
        media_type='application/octet-stream' 
    )