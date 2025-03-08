from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
import os

router = APIRouter()

# Recupera i parametri da docker-compose
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "")
REALM_NAME = os.getenv("KEYCLOAK_REALM", "")
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "")

# Modello dati per il login
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
    """
    Effettua il login su Keycloak e restituisce il token.
    """
    token_url = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/token"

    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username": data.username,
        "password": data.password,
        "grant_type": "password"
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    response = requests.post(token_url, data=payload, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Invalid credentials")

    return response.json()