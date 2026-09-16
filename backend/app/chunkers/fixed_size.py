from abc import ABC, abstractmethod
from typing import List

from app.models.document import Document
from app.models.chunk import Chunk
from app.chunkers.base import Chunker
from app.config.types import ChunkMetadata

class FixedSize(Chunker):

    def __init__(self, chunk_size: int = 500):
        self.chunk_size = chunk_size 

    def split(self, documents: List[Document]):
        chunks = []

        for document in documents:

            content = document.content
            #refrain modifying source metadata

            chunk_id = 1
            for i in range(0, len(content), self.chunk_size):
                last_index = (i + self.chunk_size)
                last_index = len(content) if last_index >= len(content) else last_index

                text = content[i:last_index]

                doc_metadata = document.metadata.copy()
                metadata: ChunkMetadata = {"source":doc_metadata["source"], 
                                            "type":doc_metadata["type"], 
                                            "chunk_id":chunk_id}
                chunk_id += 1
                
                chunks.append(
                    Chunk(
                        text=text,
                        metadata= metadata
                    )
                )

        return chunks