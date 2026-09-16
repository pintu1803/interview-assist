from app.models.chunk import Chunk
from typing import List
from abc import ABC, abstractmethod

class PromptBuilder(ABC):
    @abstractmethod
    def build(self, question:str, chunks:List[Chunk]) -> str:
        pass