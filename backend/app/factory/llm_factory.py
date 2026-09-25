from app.config.settings import settings
from app.llm.provider_registry import PROVIDER_REGISTRY
from app.llm.fallback_llm import Fallback_LLM

def create_llm() -> Fallback_LLM:
    providers = []

    for name in settings.llm_provider_list:

        if name not in PROVIDER_REGISTRY:
            raise ValueError(f"Unknown provider: {name}")

        providers.append(
            PROVIDER_REGISTRY[name]()
        )

    return Fallback_LLM(providers)