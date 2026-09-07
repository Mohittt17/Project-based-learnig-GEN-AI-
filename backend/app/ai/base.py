"""
Abstract AI service interface.
All AI provider adapters MUST implement this interface.
This ensures the application is decoupled from any specific AI provider.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class GenerateResult:
    """Structured result from code generation."""
    success: bool
    language: str
    code: str
    explanation: str
    suggestions: list[str] = field(default_factory=list)
    error: Optional[str] = None
    tokens_used: Optional[int] = None


@dataclass
class DebugResult:
    """Structured result from code debugging."""
    success: bool
    has_issues: bool
    language: str
    issues: list[dict]          # [{line, severity, category, problem, explanation, fix}]
    corrected_code: Optional[str] = None
    overall_explanation: str = ""
    error: Optional[str] = None
    tokens_used: Optional[int] = None


@dataclass
class ExplainResult:
    """Structured result from code explanation."""
    success: bool
    language: str
    purpose: str
    logic_breakdown: str
    important_sections: list[dict] = field(default_factory=list)  # [{section, explanation}]
    potential_issues: list[str] = field(default_factory=list)
    error: Optional[str] = None
    tokens_used: Optional[int] = None


class AIServiceBase(ABC):
    """
    Abstract base class for all AI provider adapters.
    To add a new provider (e.g., OpenAI), create a new class that inherits
    from AIServiceBase and implements all abstract methods.
    """

    @abstractmethod
    def generate_code(self, prompt: str, language: str) -> GenerateResult:
        """Generate code from a natural language prompt."""
        ...

    @abstractmethod
    def debug_code(self, code: str, language: str, error_message: str = "") -> DebugResult:
        """Analyze code for bugs and return structured debug information."""
        ...

    @abstractmethod
    def explain_code(self, code: str, language: str) -> ExplainResult:
        """Explain the purpose and logic of the provided code."""
        ...
