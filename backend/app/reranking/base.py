
from abc import ABC, abstractmethod
from app.config.types import RetrievedChunk

class ReRanker:
    """
    This accepts lot of retrieved chunks from db and
    raranks them then top_k docs are picked from that.
    """
    @abstractmethod
    def rerank(self, query: str, 
               retrieved_chunks: RetrievedChunk,
               top_k: int) -> RetrievedChunk:
        #retrieved_chunks are coming from db(chroma/qdrant)
        #don't create hard coupling for that
        pass