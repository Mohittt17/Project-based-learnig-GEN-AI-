"""
Google Gemini adapter — implements AIServiceBase using the Gemini API.
Uses structured JSON prompts to ensure parseable, reliable responses.
"""
import json
import re
import logging
from typing import Optional

import google.generativeai as genai

from app.ai.base import AIServiceBase, GenerateResult, DebugResult, ExplainResult
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class GeminiAdapter(AIServiceBase):
    """Concrete AI service implementation using Google Gemini."""

    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.ai_model)

    def _call_gemini(self, prompt: str) -> tuple[str, Optional[int]]:
        """Make a Gemini API call and return (text_response, tokens_used)."""
        response = self.model.generate_content(prompt)
        tokens = None
        try:
            tokens = response.usage_metadata.total_token_count
        except Exception:
            pass
        return response.text, tokens

    def _extract_json(self, text: str) -> dict:
        """
        Extract JSON from AI response text.
        Gemini sometimes wraps JSON in markdown code blocks — this handles that.
        """
        # Try direct JSON parse first
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass

        # Try extracting from ```json ... ``` or ``` ... ``` blocks
        pattern = r"```(?:json)?\s*([\s\S]*?)```"
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue

        raise ValueError(f"Could not extract valid JSON from AI response. Raw: {text[:300]}")

    def generate_code(self, prompt: str, language: str) -> GenerateResult:
        """Generate code from a natural language prompt."""
        system_prompt = f"""You are an expert software engineer. Generate clean, well-structured {language} code.

User request: {prompt}

Respond with ONLY a valid JSON object (no markdown, no extra text):
{{
  "code": "the complete generated code here",
  "explanation": "a clear explanation of what the code does and how it works",
  "suggestions": ["tip 1", "tip 2"]
}}

Rules:
- The code must be complete and runnable
- Use proper indentation
- Add brief inline comments for complex parts
- Keep the explanation friendly and educational
"""
        try:
            raw_text, tokens = self._call_gemini(system_prompt)
            data = self._extract_json(raw_text)

            return GenerateResult(
                success=True,
                language=language,
                code=data.get("code", ""),
                explanation=data.get("explanation", ""),
                suggestions=data.get("suggestions", []),
                tokens_used=tokens,
            )
        except Exception as e:
            logger.error(f"Gemini generate_code error: {e}")
            return GenerateResult(
                success=False,
                language=language,
                code="",
                explanation="",
                error=str(e),
            )

    def debug_code(self, code: str, language: str, error_message: str = "") -> DebugResult:
        """Analyze code for bugs and return structured debug information."""
        error_context = f"\nError message from user: {error_message}" if error_message else ""

        system_prompt = f"""You are an expert code debugger. Analyze the following {language} code for bugs, errors, and issues.{error_context}

Code to analyze:
```{language}
{code}
```

Respond with ONLY a valid JSON object (no markdown, no extra text):
{{
  "has_issues": true,
  "overall_explanation": "brief summary of what is wrong overall",
  "issues": [
    {{
      "line": 5,
      "severity": "error",
      "category": "syntax",
      "problem": "short description of the problem",
      "explanation": "detailed explanation of why this is a bug",
      "fix": "how to fix it"
    }}
  ],
  "corrected_code": "the fully corrected version of the code"
}}

Severity options: "error" | "warning" | "info"
Category options: "syntax" | "runtime" | "logic" | "style" | "security"
If there are no issues, set has_issues to false and issues to an empty array.
"""
        try:
            raw_text, tokens = self._call_gemini(system_prompt)
            data = self._extract_json(raw_text)

            return DebugResult(
                success=True,
                has_issues=data.get("has_issues", False),
                language=language,
                issues=data.get("issues", []),
                corrected_code=data.get("corrected_code"),
                overall_explanation=data.get("overall_explanation", ""),
                tokens_used=tokens,
            )
        except Exception as e:
            logger.error(f"Gemini debug_code error: {e}")
            return DebugResult(
                success=False,
                has_issues=False,
                language=language,
                issues=[],
                error=str(e),
            )

    def explain_code(self, code: str, language: str) -> ExplainResult:
        """Explain the purpose and logic of the provided code."""
        system_prompt = f"""You are an expert software engineer and teacher. Explain the following {language} code clearly.

Code to explain:
```{language}
{code}
```

Respond with ONLY a valid JSON object (no markdown, no extra text):
{{
  "purpose": "one paragraph explaining what this code does overall",
  "logic_breakdown": "step-by-step explanation of the logic",
  "important_sections": [
    {{
      "section": "function/class/block name or description",
      "explanation": "what this section does"
    }}
  ],
  "potential_issues": ["issue 1", "issue 2"]
}}
"""
        try:
            raw_text, tokens = self._call_gemini(system_prompt)
            data = self._extract_json(raw_text)

            return ExplainResult(
                success=True,
                language=language,
                purpose=data.get("purpose", ""),
                logic_breakdown=data.get("logic_breakdown", ""),
                important_sections=data.get("important_sections", []),
                potential_issues=data.get("potential_issues", []),
                tokens_used=tokens,
            )
        except Exception as e:
            logger.error(f"Gemini explain_code error: {e}")
            return ExplainResult(
                success=False,
                language=language,
                purpose="",
                logic_breakdown="",
                error=str(e),
            )
