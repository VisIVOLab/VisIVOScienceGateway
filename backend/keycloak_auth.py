from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2AuthorizationCodeBearer
from keycloak import KeycloakOpenID
import os

# Configura Keycloak
KEYCLOAK_URL = "http://keycloak:8080/"
REALM_NAME = "VisIVO"
CLIENT_ID = "visivo-backend"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"  # Sostituisci con il valore corretto

keycloak_openid = KeycloakOpenID(server_url=KEYCLOAK_URL,
                                 client_id=CLIENT_ID,
                                 realm_name=REALM_NAME,
                                 client_secret_key=CLIENT_SECRET)

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{KEYCLOAK_URL}realms/{REALM_NAME}/protocol/openid-connect/auth",
    tokenUrl=f"{KEYCLOAK_URL}realms/{REALM_NAME}/protocol/openid-connect/token"
)

async def get_current_user(token: str = Security(oauth2_scheme)):
    """
    Funzione per validare il token di autenticazione con Keycloak.
    """
    try:
        user_info = keycloak_openid.introspect(token)
        if not user_info.get("active"):
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_info
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")