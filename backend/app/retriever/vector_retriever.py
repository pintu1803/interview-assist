from app.retriever.base import Retriever
from app.embeddings.base import EmbeddingModel
from app.vectorstore.base import VectorStore
from app.models.chunk import Chunk

from typing import List

class VectorRetriever(Retriever):
    def __init__(self, embedding_model: EmbeddingModel, vector_store: VectorStore):
        self.embedding_model = embedding_model
        self.vector_store = vector_store

    #embedding is done for batches
    #so, treat one vector as a batch of size 1
    def retrieve(self, query:str, top_k:int=5) -> List[Chunk]:
        vector = self.embedding_model.embed([query])[0]
        results = self.vector_store.search(self.vector_store, top_k)
        return results


        