from app.vectorstore.chroma_vector_store import ChromaVectorStore
from functools import lru_cache
from app.config.settings import settings


@lru_cache(maxsize=1)
def get_vector_store() -> ChromaVectorStore:
    return ChromaVectorStore(settings.vector_db_path, settings.db_collection_name)

