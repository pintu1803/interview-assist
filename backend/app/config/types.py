from typing import TypedDict
from collections.abc import Sequence


EmbeddingVector = Sequence[float]


class ChunkMetadata(TypedDict):
    source: str
    type: str
    chunk_id: int


class RetrievedChunk(TypedDict):
    documents: list[str]
    distances: list[float]
    metadatas: list[ChunkMetadata]