from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from datetime import datetime
import socket

# Define default arguments
default_args = {
    "owner": "airflow",
    "start_date": datetime(2024, 3, 12),
}

# Function to get the name
def get_name(**kwargs):
    kwargs['ti'].xcom_push(key="name", value="VisIVO")  # Replace "Alice" with any other name

# Function to print a greeting message with hostname
def print_greeting(**kwargs):
    ti = kwargs['ti']
    name = ti.xcom_pull(task_ids="get_name", key="name")
    hostname = socket.gethostname()
    print(f"Hello, {name}! This is running on {hostname}")

# Define DAG
with DAG(
    "test_workflow",
    default_args=default_args,
    schedule_interval=None,  # Run manually
    catchup=False,
) as dag:

    # Task 1: Get the name
    get_name_task = PythonOperator(
        task_id="get_name",
        python_callable=get_name,
        provide_context=True,
    )

    # Task 2: Print greeting using BashOperator
    print_greeting_task = BashOperator(
        task_id="print_greeting",
        bash_command="echo 'Hello, {{ ti.xcom_pull(task_ids=\"get_name\", key=\"name\") }}! Running on $(hostname)'"
    )

    # Task dependencies
    get_name_task >> print_greeting_task