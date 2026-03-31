from celery import Celery
import time
from crud.upload import list_user_uploads_by_project
from crud.output import create_output
from Schema.output import OutputCreate
from Schema.output import OutputRead
from Schema.output import OutputResponse
from crud.run import update_run_status
from crud.input import list_user_input_by_run
from database import SessionLocal
import shutil
import tempfile
import os
import subprocess
import hashlib
import pathlib
import redis

import logging
import logstash

#logstash configuration 
host = 'logstash'

logger = logging.getLogger('celery-logstash-logger')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.LogstashHandler(host, 5959, version=1))

# Definisci l'app Celery
app = Celery(
    'tasks',
    broker='redis://redis:6379/0',  # il tuo broker Redis nel docker-compose
    backend='redis://redis:6379/0'
)

# Task di esempio
@app.task
def add(x, y):
    print(f"Calcolo {x} + {y}")
    time.sleep(60)  # simuliamo lavoro pesante
    return x + y

#COPIA I FILE NELLA TMPDIR
def setup(uploads,input_datas,tmp_dir,user_id):
    entry_point = None

    for file_data in uploads:
        source_path = file_data.path
        dest_path = os.path.join(tmp_dir, file_data.original_name)
        shutil.copy2(source_path, dest_path)

        try:
            with open(source_path,'r') as f:
                content = f.read()
                logged_content = content[:10000] if len(content) > 10000 else content
                logger.info(f"[SETUP] user: {user_id} Reading {file_data.original_name}:  {content}")

        except Exception as e:
            print(f"Errore nella lettura del file {file_data.original_name} : {e}")
            logger.error(f"[SETUP ERROR] Error reading file {file_data.original_name}  : {e}")
                
        if file_data.file_type.name == "run/yml":
            entry_point = dest_path


    for inp_data in input_datas:
        source_path = inp_data.path
        dest_path = os.path.join(tmp_dir, inp_data.original_name)
        shutil.copy2(source_path, dest_path)

    return entry_point
    


def move_file(tmp_dir,new_files,db,run_id):
    dest_dir = "/app/workflows/outputs"
    for filename in new_files:

            file_path = os.path.join(tmp_dir,filename)

            #AL MOMENTO SE é UNA CARTELLA IGNORO
            if os.path.isdir(file_path):
                continue

            print(f"[DEBUG] elaborazione {filename}")

            unique_string = f"{filename}_{time.time()}"
            file_hash = hashlib.sha256(unique_string.encode('utf-8')).hexdigest()
            
            path_obj = pathlib.Path(filename)
        
      
            extension = "".join(path_obj.suffixes).lower()

            if not extension:
                extension = ""
            
            new_filename = f"{file_hash}{extension}"

            final_dest_path = os.path.join(dest_dir, new_filename)

   
            shutil.copy2(file_path, final_dest_path)
            print(f"Salvato: {filename} -> {new_filename}")

            if filename in ["streamflow.log", "CLI.log"]: 
                file_type = 5
            else:
                file_type = 6

            out = OutputCreate( id= file_hash, original_name=filename, path=final_dest_path,file_type_id=file_type,run_id = run_id )

            create_output(db,out.dict())



@app.task(bind=True) #bind true per avere self
def launch_streamflow(self,project_id:int, run_id:str,user_id:str):
    
    r_client = redis.Redis(host='redis', port=6379, db=0)
    failed = False
    current_task_id = self.request.id
    db = SessionLocal() 
    short_error = None      
    log_content = ""
    try:
     
        self.update_state(state='STARTED')
        update_run_status(db,run_id,"RUNNING")
        print("stato cambiato")

        print(f"Submit project {project_id} from user {user_id}")
        uploads = list_user_uploads_by_project(db,project_id,user_id)
        input_datas = list_user_input_by_run(db,run_id)

        tmp_dir = tempfile.mkdtemp(prefix="sf_job_")
        print(f"Job avviato in: {tmp_dir}")
            
        entry_point = setup(uploads,input_datas,tmp_dir,user_id)
        
        if not entry_point:
            #shutil.rmtree(tmp_dir)
            failed= True
            update_run_status(db,run_id,"FAILED")
            ##UPDATE  ERROR IN TABELLA 
            return
        
        before_files = set(os.listdir(tmp_dir))
        
        #log files
        stdout_file = open(os.path.join(tmp_dir, "streamflow.log"), "w")
        stderr_file = open(os.path.join(tmp_dir, "CLI.log"), "w")

        print("Sto eseguendo il comando...")
        #logger.info(f"[LAUNCH] Launching StreamFlow for run {run_id} of project {project_id} for user {user_id}")

            # cwd=tmp_dir: lavora dentro la cartella temp
        proc = subprocess.Popen( ["/usr/local/bin/streamflow", "run", entry_point,"--name",run_id], 
                cwd=tmp_dir, 
                stdout=stdout_file, 
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1)
        
        #fin tanto che il processo va leggo stderr e lo mando a redi e poi salvo su file
        for line in proc.stderr:
            r_client.publish(f"logs:{run_id}", line)
            
            stderr_file.write(line)
            stderr_file.flush() # Forza il salvataggio su disco immediato


        proc.wait()


        
        if proc.returncode != 0:
            # Streamflow è fallito. Leggiamo le ultime righe di error.log
            # per dare un'anteprima all'utente
            failed= True
            update_run_status(db,run_id,"FAILED")
            
            stderr_file.flush()
            with open(stderr_file.name, "r") as f:
                log_content = f.read()
                # Prendiamo solo i primi 200 caratteri per non intasare la tabella
                short_error = log_content[:200] + "..." if len(log_content) > 200 else log_content
        
        stdout_file.close()
        stderr_file.close()
        print("[TEST ERR]")
        print (f"[ERROR]{short_error}")


        after_files = set(os.listdir(tmp_dir))

        # nuovi file generati
        new_files = after_files - before_files
        
        move_file(tmp_dir,new_files,db,run_id)
        
        if not failed:
            update_run_status(db,run_id,"COMPLETED")

        return{
                "status": "STARTED", 
                "task_id": current_task_id, 
                "work_dir": tmp_dir
            }

    except Exception as e:
        update_run_status(db,run_id,"FAILED")
        
        print(f"Altro errore imprevisto: {e}")   
    finally:
        r_client.publish(f"stream_logs:{run_id}", "--- PROCESS FINISHED ---")
        db.close()
        try:
            shutil.rmtree(tmp_dir)
            print(f"Pulizia completata: {tmp_dir} eliminata.")
        except OSError as e:
            print(f"Errore durante l'eliminazione di {tmp_dir}: {e}")