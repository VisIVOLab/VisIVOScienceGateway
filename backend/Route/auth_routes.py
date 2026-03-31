from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from keycloak_auth import get_current_user 
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
    #print(token_url)
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

@router.get("/secure-data")
async def secure_data(user: dict = Depends(get_current_user)):
    """Protected route requiring authentication"""
    return {"message": "Secure Data Accessed", "user": user}
@router.get("/me", tags=["auth"])

async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the authenticated user's information.
    """
    return {"user_id": current_user.get("sub"), "username": current_user.get("preferred_username")}


    