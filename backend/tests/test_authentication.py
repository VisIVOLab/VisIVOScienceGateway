import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch
from keycloak_auth import keycloak_openid

client = TestClient(app)


def test_login_success():
    mock_token = {"access_token": "mock_access_token"}
    
    with patch.object(keycloak_openid, 'token', return_value=mock_token):
        response = client.post("/auth/login", json={"username": "testuser", "password": "testuser"})
        assert response.status_code == 200
        assert "access_token" in response.json()


def test_login_failure():
    with patch.object(keycloak_openid, 'token', side_effect=Exception("Invalid credentials")):
        response = client.post("/auth/login", json={"username": "wronguser", "password": "wrongpass"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"


def test_protected_route_with_valid_token():
    mock_user_info = {"active": True, "preferred_username": "testuser"}

    with patch.object(keycloak_openid, 'introspect', return_value=mock_user_info):
        headers = {"Authorization": "Bearer mock_access_token"}
        response = client.get("/auth/secure-data", headers=headers)  # <-- Fix the path
        assert response.status_code == 200

def test_protected_route_with_invalid_token():
    with patch.object(keycloak_openid, 'introspect', return_value={"active": False}):
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/auth/secure-data", headers=headers)  # <-- Fix the path
        assert response.status_code == 401