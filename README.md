# VisIVO Science Gateway with Apache Airavata, React, Keycloak, and PostgreSQL

## Overview
This project is a Science Gateway called **VisIVO Science Gateway** that integrates **Apache Airavata**, **React.js**, **Keycloak**, and **PostgreSQL**, all orchestrated with **Docker Compose**. It provides a user-friendly frontend for job submission and monitoring while leveraging Airavata for HPC workload management.

## Features
- **React.js** as the frontend
- **Apache Airavata** for scientific workflow management
- **Keycloak** for authentication (OAuth 2.0 / OpenID Connect)
- **PostgreSQL** as the database backend
- **Docker Compose** for containerized deployment

## Architecture
```
+----------------+       +-----------------+       +-----------------+
| React Frontend | <---> | Apache Airavata | <---> | PostgreSQL (DB) |
+----------------+       +-----------------+       +-----------------+
        |                      |                        |
        v                      v                        v
+----------------+      +-----------------+       +----------------+
|    Nginx      |      |    Keycloak      |       |    Docker      |
+----------------+      +-----------------+       +----------------+
```

## Prerequisites
Make sure you have the following installed:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/visivo-science-gateway.git
cd visivo-science-gateway
```

### 2️⃣ Build and Run the Containers
```bash
docker-compose up --build
```

### 3️⃣ Access the Services
- **Frontend (React.js):** [http://localhost](http://localhost)
- **Apache Airavata API:** [http://localhost:8080](http://localhost:8080)
- **Keycloak Admin Panel:** [http://localhost:8081](http://localhost:8081)
  - Username: `admin`
  - Password: `admin`
- **PostgreSQL:** Runs in the background on port `5432`

## Configuration
### Environment Variables
Modify the `docker-compose.yml` file if you need to adjust credentials or endpoints.

### Setting Up Keycloak
1. Log in to **Keycloak Admin Panel** (`http://localhost:8081`)
2. Create a new **Realm** (e.g., `VisIVO`)
3. Add a **Client** (`react-frontend`)
   - **Access Type:** Public
   - **Root URL:** `http://localhost`
4. Obtain the **Client ID** and update React’s authentication settings

### Configuring React for Authentication
Edit `frontend/src/Auth.js` and replace `TUO_CLIENT_ID` with the Keycloak client ID:
```javascript
<GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
  <Auth />
</GoogleOAuthProvider>
```

## API Usage
Test the Apache Airavata API with:
```bash
curl http://localhost:8080/api/experiments
```

## Stopping the Services
To stop and remove containers, run:
```bash
docker-compose down
```

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push the branch (`git push origin new-feature`)
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Contact
For issues or suggestions, open a GitHub issue or contact **visivolab.oact@inaf.it**.