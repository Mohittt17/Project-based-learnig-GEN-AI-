"""
AI service factory.
Returns the correct AI adapter based on the AI_PROVIDER setting.
To add a new provider: create a new adapter, add a case here — done.
"""
from functools import lru_cache
from app.ai.base import AIServiceBase
from app.core.config import get_settings


@lru_cache()
def get_ai_service() -> AIServiceBase:
    """
    Factory function that returns the configured AI adapter.
    Cached so the adapter (and its API connection) is created only once.
    """
    settings = get_settings()
    provider = settings.ai_provider.lower()

    if provider == "gemini":
        from app.ai.gemini_adapter import GeminiAdapter
        return GeminiAdapter()

    # Future providers can be added here:
    # elif provider == "openai":
    #     from app.ai.openai_adapter import OpenAIAdapter
    #     return OpenAIAdapter()

    raise ValueError(f"Unsupported AI provider: '{provider}'. Check AI_PROVIDER in .env")
