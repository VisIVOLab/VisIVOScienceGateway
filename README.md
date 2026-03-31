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
mv nginx/nginx.conf.example nginx/nginx.conf
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
- **Airflow Web UI**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Keycloak Admin UI**: [http://localhost:8081](http://localhost:8081) (default admin: `admin/admin`)

## Authentication with Keycloak
1. Open the Keycloak Admin UI and log in with `admin/admin`.
2. Create a new realm for the application.
3. Configure client credentials for the frontend and backend.
4. Users will authenticate via Keycloak when logging into the frontend.
5. The backend will validate authentication tokens via Keycloak.

## Development
### Frontend
Navigate to the frontend directory and start the development server:
```sh
cd frontend
npm install
npm run dev
```

### Backend
Navigate to the backend directory and start the FastAPI server:
```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Configuration
Modify environment variables in the `.env` files for each service to customize settings, including Keycloak credentials.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Added new feature"`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any inquiries, reach out to visivolab.oact@inaf.it or open an issue in the repository.