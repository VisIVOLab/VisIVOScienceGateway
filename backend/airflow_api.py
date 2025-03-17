import requests
from fastapi import HTTPException

AIRFLOW_API_URL = "http://airflow-webserver:8080/api/v1"

def trigger_dag_refresh():
    """
    Triggers a DAG refresh by calling the Airflow API.
    """
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(f"{AIRFLOW_API_URL}/dags", headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh DAGs: {str(e)}")

    return response.json()