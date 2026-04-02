# Visivo Science Gateway

Visivo Science Gateway is a web-based platform designed for executing and managing scientific workflows using Streamflow and Slurm. The system includes a backend API, a frontend interface, an authentication service with Keycloak, and an orchestration layer for job scheduling and execution.

## Features
- **Web-based UI**: A React-based frontend for users to define and monitor workflows.
- **Workflow Execution**: Streamflow for scheduling and executing jobs.
- **Slurm Integration**: Submit and manage jobs on a Slurm cluster.
- **Authentication & Authorization**: Keycloak for user management and authentication.
- **REST API**: A FastAPI backend for communication between the frontend, Keycloak, and Airflow.
- **Dockerized Deployment**: All components run in containers for easy setup and management.

## Prerequisites
Ensure you have the following installed before running the project:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for frontend development)
- [Python 3.9+](https://www.python.org/downloads/) (for backend development)

## Installation
Clone the repository:
```sh
git clone https://github.com/visivolab/VisIVOScienceGateway.git
cd VisIVOScienceGateway
```

## SSH Configuration for cluster Access

1. Generate key 
Run the following command from the project root:

```sh
ssh-keygen -t rsa -b 4096 -f ./backend/id_rsa_container -q -N ""
```
 
This will create two files in the backend/ directory:

-   id_rsa_container (Private Key - Keep this safe and never share it)
-   id_rsa_container.pub (Public Key)


2. Authorize the key on the Cluster
To allow the container to log in, you must add the public key to your cluster account.


## First start

## Set up the envirnoment:

1. Rename the configuration files:
```sh
mv .env.example .env
mv frontend/vite.config.js.example frontend/vite.config.js
mv docker-compose.yaml.example docker-compose.yaml
```

2. Modify the .env file:
Open the .env file and update the variables according to your localc setup:


| Variable | Description |
|----------|-------------|
| `KEYCLOAK_DB_PASSWORD` | Password for the Keycloak database. |
| `KEYCLOAK_ADMIN_PASSWORD` | Password for the Keycloak `admin` user. |
| `DB_PASSWORD` | Password for the main PostgreSQL/MySQL database. |
| `CLUSTER_ACCOUNT` | Your SSH username on the cluster (e.g., `pleiadi`). |
| `CLUSTER_IP` | The IP address or hostname of the cluster. |
| `KEYCLOAK_REALM` | The Realm name configured in Keycloak. |
| `KEYCLOAK_CLIENT_ID` | The Client ID for the backend. |
| `REACT_APP_KEYCLOAK_REALM` | The Realm name for the React frontend. |
| `REACT_APP_KEYCLOAK_CLIENT_ID` | The Client ID for the React frontend. |

Start all services using Docker Compose:
```sh
docker-compose up -d --build
```
This will start the following services:
- PostgreSQL (Database)
- Apache Airflow (Workflow Management)
- Redis (Message Broker)
- FastAPI Backend (API Service)
- React Frontend (User Interface)
- Keycloak (Authentication Service)


## Set the fingerprint on worker container
1. Connect to worker shell: 
```sh
docker exec -it worker /bin/bash
```
2. Then run a maunal ssh connection:
Replace <your_user> and <cluster_domain>  with actual credentials.
```sh
ssh -i id_rsa_container <your_user>@<cluster_domain>
```
3. Confirm connection:
 When prompted with:

Are you sure you want to continue connecting (yes/no/[fingerprint])?

Type yes and press Enter.

4. Exit
Once the connection is etabilished, you can tipe logout and then exit to return to your machine. 

## Database Initialization
Before running the application for the first time, you must initialize the database schema. This script creates the necessary tables and relations.

```sh
docker exec -it backend /bin/bash
```

Then 
```sh
python init_db.py
```
If the script finishes without errors, your database is ready. You can now exit the container



### Accessing the Services

- type `localhost` on your browser to access frontend
- type `localhost/keycloak` to access keycloak admin UI
- type `localhost/kibana` to access kibana



## Authentication with Keycloak
1. Open the Keycloak Admin UI and log in with `<your_user>/<your_pasw>`.
2. Create a new realm for the application.
3. Configure client credentials for the frontend and backend in `.env` file.
4. Users will authenticate via Keycloak when logging into the frontend.
5. The backend will validate authentication tokens via Keycloak.

# Use case

0. Log in
1. Use the sidebar to navigate to "Project" section
2. Create new project and choose classic (Note: pyAETNA configuration will not work on your setup)
3. Go into the project
4. Add a `.cwl` file (or many)
5. Click **new run** button, the website provides you a list of input file that your cwl needs. 
6. Upload your input data
7. Upload a yaml configuration file with filename and variables association *(Note: for this file check the `yaml configuration` radio button)*
8. Click **next**, then type the slurm parameters you want. 
9. Wait until your execution ends, you can watch realtime information *(May not work properly on safari browser)*
10. Download your results!




## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any inquiries, reach out to visivolab.oact@inaf.it or open an issue in the repository.