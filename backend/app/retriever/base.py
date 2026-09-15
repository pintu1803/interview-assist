from app.models.chunk import Chunk
from abc import ABC, abstractmethod
from typing  import List

class Retriever:
    """Retriever is the extra layer, which we are putting to hide
    query -> embedding -> vector search operations
    user gives query and retriever gives top k chunks,
    internal working is hidden from user
    So, query : str """
    @abstractmethod
    def retrieve(self, query:str, top_k:int=5) -> List[Chunk]:
        pass