from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import jwt  # PyJWT for decoding Keycloak tokens
import os

# Environment variables for Keycloak configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
REALM_NAME = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_PUBLIC_KEY_URL = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"

# Token security
security = HTTPBearer()

def get_public_key():
    """
    Fetch the Keycloak public key from the JWKS endpoint.
    This key is used to verify the JWT token.
    """
    try:
        jwks = requests.get(KEYCLOAK_PUBLIC_KEY_URL).json()
        return jwt.PyJWKSet.from_dict(jwks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Keycloak public key: {str(e)}")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Extracts and verifies user information from the Keycloak JWT token.
    """
    token = credentials.credentials
    try:
        jwks = get_public_key()
        public_key = jwks.keys[0].key  # Get first key from JWKS set
        decoded_token = jwt.decode(token, public_key, algorithms=["RS256"], audience="account")
        return decoded_token  # Contains 'sub' (user_id) and roles

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
