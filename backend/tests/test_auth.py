"""
TC-AUTH-001 through TC-AUTH-006: Authentication endpoint tests.
"""
import pytest


def test_register_success(client):
    """TC-AUTH-001: Register a new user with valid data."""
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "user_id" in data


def test_register_duplicate_username(client):
    """TC-AUTH-002: Registration fails with duplicate username."""
    client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup1@example.com",
        "password": "securepassword123",
    })
    response = client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup2@example.com",
        "password": "securepassword123",
    })
    assert response.status_code == 400
    assert "already taken" in response.json()["detail"]


def test_register_duplicate_email(client):
    """TC-AUTH-003: Registration fails with duplicate email."""
    client.post("/auth/register", json={
        "username": "emailuser1",
        "email": "same@example.com",
        "password": "securepassword123",
    })
    response = client.post("/auth/register", json={
        "username": "emailuser2",
        "email": "same@example.com",
        "password": "securepassword123",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_weak_password(client):
    """TC-AUTH-004: Registration fails with password under 8 chars."""
    response = client.post("/auth/register", json={
        "username": "weakpwduser",
        "email": "weak@example.com",
        "password": "short",
    })
    assert response.status_code == 422


def test_login_success(client):
    """TC-AUTH-005: Login with correct credentials returns a JWT."""
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "correctpassword",
    })
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "correctpassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """TC-AUTH-006: Login fails with incorrect password."""
    client.post("/auth/register", json={
        "username": "wrongpwduser",
        "email": "wrongpwd@example.com",
        "password": "correctpassword",
    })
    response = client.post("/auth/login", json={
        "email": "wrongpwd@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]
