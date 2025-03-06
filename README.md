# Visivo Science Gateway

Visivo Science Gateway is a web-based platform designed for executing and managing scientific workflows using Apache Airflow and Slurm. The system includes a backend API, a frontend interface, and an orchestration layer for job scheduling and execution.

## Features
- **Web-based UI**: A React-based frontend for users to define and monitor workflows.
- **Workflow Execution**: Apache Airflow for scheduling and executing jobs.
- **Slurm Integration**: Submit and manage jobs on a Slurm cluster.
- **REST API**: A FastAPI backend for communication between the frontend and Airflow.
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

## Running the Project
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

### Accessing the Services
- **Airflow Web UI**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)

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
Modify environment variables in the `.env` files for each service to customize settings.

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