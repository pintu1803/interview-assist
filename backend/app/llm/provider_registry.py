from app.config.settings import settings
from app.llm.gemini import GeminiLLM
from app.llm.chatgpt import OpenAILLM
from app.llm.groq import GroqLLM

PROVIDER_REGISTRY = {
    "groq": lambda: GroqLLM(
        settings.groq_api_key,
        settings.groq_model
    ),

    "gemini": lambda: GeminiLLM(
        settings.gemini_api_key,
        settings.gemini_model
    ),

    "openai": lambda: OpenAILLM(
        settings.openai_api_key,
        settings.openai_model
    ),
}