"""
TC-GEN-001 through TC-GEN-004: Code generation endpoint tests.
These tests mock the AI service to avoid real API calls during testing.
"""
import pytest
from unittest.mock import patch, MagicMock
from app.ai.base import GenerateResult


def get_auth_token(client) -> str:
    """Helper: register and return a JWT token."""
    client.post("/auth/register", json={
        "username": "gentest",
        "email": "gentest@example.com",
        "password": "testpassword123",
    })
    response = client.post("/auth/login", json={
        "email": "gentest@example.com",
        "password": "testpassword123",
    })
    return response.json()["access_token"]


def test_generate_requires_auth(client):
    """TC-GEN-001: Generate endpoint returns 401 without JWT."""
    response = client.post("/api/generate", json={
        "prompt": "print hello world",
        "language": "python",
    })
    assert response.status_code == 401


def test_generate_empty_prompt(client):
    """TC-GEN-002: Generate endpoint returns 422 for empty prompt."""
    token = get_auth_token(client)
    response = client.post(
        "/api/generate",
        json={"prompt": "", "language": "python"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_generate_success_mocked(client):
    """TC-GEN-003: Generate endpoint returns structured response with valid input."""
    token = get_auth_token(client)

    mock_result = GenerateResult(
        success=True,
        language="python",
        code="print('Hello, World!')",
        explanation="This code prints Hello World.",
        suggestions=["Add a newline at the end"],
        tokens_used=50,
    )

    with patch("app.api.generate.get_ai_service") as mock_factory:
        mock_service = MagicMock()
        mock_service.generate_code.return_value = mock_result
        mock_factory.return_value = mock_service

        response = client.post(
            "/api/generate",
            json={"prompt": "Print hello world", "language": "python"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "python"
    assert "print" in data["code"]
    assert "session_id" in data


def test_generate_ai_failure_returns_502(client):
    """TC-GEN-004: Generate returns 502 when AI service fails."""
    token = get_auth_token(client)

    mock_result = GenerateResult(
        success=False,
        language="python",
        code="",
        explanation="",
        error="AI provider unavailable",
    )

    with patch("app.api.generate.get_ai_service") as mock_factory:
        mock_service = MagicMock()
        mock_service.generate_code.return_value = mock_result
        mock_factory.return_value = mock_service

        response = client.post(
            "/api/generate",
            json={"prompt": "Create a function", "language": "python"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 502
