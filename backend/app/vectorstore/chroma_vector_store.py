import chromadb
import uuid
from typing import List, TypedDict
from app.config.settings import settings

from app.vectorstore.base import VectorStore
from app.config.types import (EmbeddingVector, ChunkMetadata, RetrievedChunk)


class ChromaVectorStore(VectorStore):
    """
    Chroma db:
    1. add_documents api accepts OneOrMany, so pass everything as a List.
    Similarly, similarity_search returns OneOrMany, so it return a List for everything.
    2. It provides the api types; Embedding for vector, Metadata for metadata, QueryResult for top k results.
    3. Embedding is simple list[float] - the normal vector
    4. Metadata is simple dict - it can contain whatevery key-value pair it wants
    5. QueryResult is little interesting guy here.
    Say, we asked for K results. so, it fetches K rows.
    Makes a dict, using column names as keys and values are put in list.
    "ids":[ [id1, id2], [id3, id4] ]
    "documents":[ [doc1, doc2], [doc3, doc5] ]
    "chunk_ids": [ [], [] ]
    So, QueryResult is just QueryResult, not List

    """
    #initialize db client and collection
    def __init__(self, persist_directory, collection_name):
        
        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection_name = collection_name

        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )

    #given vector, document and metadata, add a row in database
    def add_documents(self, documents:List[str], 
                      embeddings:List[EmbeddingVector], 
                      metadatas:List[ChunkMetadata]) -> None:

        ids = [str(uuid.uuid4()) for _ in documents ]

        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas, # type: ignore
            ids=ids
        )

    #method for performing similarity search -> gives top K results
    def similarity_search(self, query_embedding:EmbeddingVector, k=5) -> RetrievedChunk:

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )

        res: RetrievedChunk = {"documents":[], "metadatas":[], "distances":[]}
        res["documents"] = results["documents"][0] # type: ignore
        res["distances"] = results["distances"][0] # type: ignore
        res["metadatas"]= results["metadatas"][0] # type: ignore
        return res


    def reset(self):
        self.client.delete_collection(self.collection_name)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)