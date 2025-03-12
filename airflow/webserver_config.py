import os
from flask_appbuilder.security.manager import AUTH_OAUTH
from airflow.www.security import AirflowSecurityManager

# Read Keycloak configuration from environment variables
KEYCLOAK_INTERNAL_URL = os.getenv("KEYCLOAK_INTERNAL_URL", "")
KEYCLOAK_EXTERNAL_URL = os.getenv("KEYCLOAK_EXTERNAL_URL", "")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "VisIVO")
KEYCLOAK_CLIENT_ID = os.getenv("AIRFLOW_KEYCLOAK_CLIENT_ID", "")
KEYCLOAK_CLIENT_SECRET = os.getenv("AIRFLOW_KEYCLOAK_CLIENT_SECRET", "")

# Authentication type (OAuth with Keycloak)
AUTH_TYPE = AUTH_OAUTH
AUTH_USER_REGISTRATION = True
AUTH_ROLES_SYNC_AT_LOGIN = True  # Synchronize roles at each login
AUTH_USER_REGISTRATION_ROLE = "Viewer"

# Role mappings between Keycloak and Airflow
AUTH_ROLES_MAPPING = {
    "Viewer": ["Viewer"],
    "Admin": ["Admin"],
    "User": ["User"],
    "Public": ["Public"],
    "Op": ["Op"],
}

# OAuth providers configuration (Keycloak)
OAUTH_PROVIDERS = [
    {
        "name": "keycloak",
        "token_key": "access_token",
        "icon": "fa-key",
        "remote_app": {
            "client_id": KEYCLOAK_CLIENT_ID,
            "client_secret": KEYCLOAK_CLIENT_SECRET,
            "client_kwargs": {"scope": "openid email profile"},
            "access_token_url": f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token",
            "authorize_url": f"{KEYCLOAK_EXTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/auth",
            "api_base_url": f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect",
            "userinfo_endpoint": f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/userinfo",
            "jwks_uri": f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs",
        },
    }
]

class KeycloakSecurityManager(AirflowSecurityManager):
    """
    Custom security manager for integrating Airflow with Keycloak authentication.
    This class overrides `get_oauth_user_info` to correctly extract user roles 
    from Keycloak's JWT token.
    """
     
    def get_oauth_user_info(self, provider, response):
        if provider == "keycloak":
            token = response.get("access_token")
            if not token:
                return None

            from authlib.jose import jwt
            from authlib.jose.errors import JoseError
            import requests

            try:
                jwks = requests.get(OAUTH_PROVIDERS[0]["remote_app"]["jwks_uri"]).json()
                claims = jwt.decode(token, jwks, claims_options={"iss": {"essential": True}})
                claims.validate()
            except JoseError:
                return None

            # Extract roles from realm_access (global roles)
            realm_roles = claims.get("realm_access", {}).get("roles", [])
            print(f"\n\nExtracted roles from realm_roles: {realm_roles}\n\n")

            # Extract roles from resource_access (client-specific roles)
            client_roles = claims.get("resource_access", {}).get(KEYCLOAK_CLIENT_ID, {}).get("roles", [])
            print(f"\n\nExtracted roles from client_roles: {client_roles}\n\n")

            # Combine both role lists, removing duplicates
            roles = list(set(realm_roles + client_roles))


            print(f"claims:\n\n{claims}\n\n")

            print(f"\n\nExtracted roles from Keycloak: {roles}\n\n")

            return {
                "username": claims.get("preferred_username"),
                "email": claims.get("email"),
                "first_name": claims.get("given_name"),
                "last_name": claims.get("family_name"),
                "role_keys": roles,  # This will map roles into Airflow
            }
        return None
    
# Set the custom security manager for Airflow
SECURITY_MANAGER_CLASS = KeycloakSecurityManager
