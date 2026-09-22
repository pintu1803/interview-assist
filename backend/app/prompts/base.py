from app.models.chunk import Chunk
from app.config.types import RetrievedChunk
from abc import ABC, abstractmethod

class PromptBuilder(ABC):
    @abstractmethod
    def build(self, question:str, chunks:RetrievedChunk) -> str:
        pass