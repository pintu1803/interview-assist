import chromadb
import uuid
import numpy as np

#needed for chroma db method hints
from collections.abc import Sequence

from typing import List

from app.vectorstore.base import VectorStore

from chromadb.api.types import Metadata
from chromadb.api.types import QueryResult
from chromadb.api.types import Embedding


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

    """
    #initialize db client and collection
    def __init__(self,
                persist_directory="storage/chroma_db",
                collection_name="documents"
                ):
        
        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )

    #given vector, document and metadata, add a row in database
    def add_documents(self, documents:List[str], 
                      embeddings:List[Embedding], 
                      metadatas:List[Metadata]) -> None:

        ids = [str(uuid.uuid4()) for _ in documents ]

        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    #method for performing similarity search -> gives top K results
    def similarity_search(self, query_embedding:Embedding, k=5) -> QueryResult:

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=k
        )

        return results
    