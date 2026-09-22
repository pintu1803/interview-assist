
from abc import ABC, abstractmethod
from typing import List
from app.config.types import (EmbeddingVector, ChunkMetadata, RetrievedChunk)

class VectorStore(ABC):
    """the api takes the list of documents, embeddings and metadatas, 
    but internally it adds one record as a row.
    So, each item of these lists will make a separate row in the db"""
    @abstractmethod
    def add_documents(
        self,
        documents:List[str],
        embeddings:List[EmbeddingVector],
        metadatas:List[ChunkMetadata]
    )-> None:
        pass


    @abstractmethod
    def similarity_search(
        self,
        query_embedding:EmbeddingVector,
        k:int=5
    ) -> RetrievedChunk:
        pass





