import requests
import logging
import os
from flask import request, Response
from airflow.api.auth.backend.default import requires_authentication
from jwt import decode, ExpiredSignatureError, InvalidTokenError

KEYCLOAK_URL = "http://keycloak:8081"
REALM = "VisIVO"
CLIENT_ID = os.getenv("AIRFLOW_KEYCLOAK_CLIENT_ID", "")

KEYCLOAK_PUBLIC_KEY_URL = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"

def get_public_key():
    """Fetches the public key from Keycloak."""
    try:
        response = requests.get(KEYCLOAK_PUBLIC_KEY_URL)
        response.raise_for_status()
        jwks = response.json()
        return jwks["keys"][0]  # Assuming only one key is returned
    except Exception as e:
        logging.error(f"Failed to fetch Keycloak public key: {e}")
        return None

def verify_token(token):
    """Verifies the Keycloak token using the fetched public key."""
    try:
        public_key = get_public_key()
        if not public_key:
            return None

        decoded_token = decode(token, key=public_key, algorithms=["RS256"], audience=CLIENT_ID)
        return decoded_token
    except ExpiredSignatureError:
        logging.error("Token expired")
        return None
    except InvalidTokenError:
        logging.error("Invalid token")
        return None

@requires_authentication
def authenticate():
    """Airflow authentication function using Keycloak."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return Response("Missing Bearer token", status=401)

    token = auth_header.split(" ")[1]
    user_info = verify_token(token)

    if user_info is None:
        return Response("Invalid Keycloak token", status=401)

    return user_info

def init_app(_):
    """Required function for Airflow to load authentication backend."""
    logging.info("Initializing Keycloak authentication backend")