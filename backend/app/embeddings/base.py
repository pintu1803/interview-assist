
from abc import ABC, abstractmethod
from typing import List
from app.config.types import EmbeddingVector


class EmbeddingModel(ABC):
    """Embedding happens in batch.
    Text input is given in list
    Vector output is got in list"""

    @abstractmethod
    def embed(self, texts: List[str]) -> List[EmbeddingVector]:
        pass