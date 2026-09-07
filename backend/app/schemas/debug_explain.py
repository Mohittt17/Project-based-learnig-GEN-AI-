"""Pydantic schemas for debug and explain endpoints."""
from pydantic import BaseModel, field_validator
from typing import Optional


class DebugRequest(BaseModel):
    code: str
    language: str = "python"
    error_message: str = ""

    @field_validator("code")
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 10000:
            raise ValueError("Code must be under 10,000 characters")
        return v


class IssueDetail(BaseModel):
    line: Optional[int] = None
    severity: str  # error | warning | info
    category: str  # syntax | runtime | logic | style | security
    problem: str
    explanation: str
    fix: str


class DebugResponse(BaseModel):
    success: bool
    session_id: str
    language: str
    has_issues: bool
    overall_explanation: str
    issues: list[IssueDetail] = []
    corrected_code: Optional[str] = None
    error: Optional[str] = None


class ExplainRequest(BaseModel):
    code: str
    language: str = "python"

    @field_validator("code")
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 10000:
            raise ValueError("Code must be under 10,000 characters")
        return v


class SectionDetail(BaseModel):
    section: str
    explanation: str


class ExplainResponse(BaseModel):
    success: bool
    session_id: str
    language: str
    purpose: str
    logic_breakdown: str
    important_sections: list[SectionDetail] = []
    potential_issues: list[str] = []
    error: Optional[str] = None
