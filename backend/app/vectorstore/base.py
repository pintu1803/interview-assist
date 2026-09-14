
from abc import ABC, abstractmethod
from typing import List
from app.models.chunk import Chunk

class VectorStore(ABC):
    @abstractmethod
    def store(self, chunks: List[Chunk], embeddings: List[List[float]]):
        pass

    @abstractmethod
    def search(self, query_vector: List[float], top_k: int = 5) -> List[Chunk]:
        pass