
from abc import ABC, abstractmethod
from typing import List

from app.models.document import Document
from app.models.chunk import Chunk

class Chunker(ABC):
    """
    Chunk is an abstract method, which is implemented by various chunking strategies.
    It accepts a list of documents(one or many) and converts into list of chunks
    """
    @abstractmethod
    def chunk(self, documents: List[Document]) -> List[Chunk]:
        pass
