from app.reranking.base import ReRanker
from app.reranking.cross_encoder_reranker import CrossEncoderReranker
from app.config.settings import settings

def create_reranker(provider_name) -> ReRanker:

    provider = provider_name

    if provider in ["cross_encoder", "cross-encoder"]:
        return CrossEncoderReranker(modelname=settings.reranker_model_name)

    raise ValueError(f"Unsupported reranker provider {provider}")
     
