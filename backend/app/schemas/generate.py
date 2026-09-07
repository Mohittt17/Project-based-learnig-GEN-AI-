"""Pydantic schemas for code generation endpoint."""
from pydantic import BaseModel, field_validator
from typing import Optional
from enum import Enum


class SupportedLanguage(str, Enum):
    python = "python"
    c = "c"
    cpp = "cpp"
    java = "java"
    javascript = "javascript"


class GenerateRequest(BaseModel):
    prompt: str
    language: SupportedLanguage = SupportedLanguage.python

    @field_validator("prompt")
    @classmethod
    def prompt_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty")
        if len(v) > 2000:
            raise ValueError("Prompt must be under 2000 characters")
        return v


class GenerateResponse(BaseModel):
    success: bool
    session_id: str
    language: str
    code: str
    explanation: str
    suggestions: list[str] = []
    error: Optional[str] = None
