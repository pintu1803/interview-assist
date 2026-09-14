from abc import ABC, abstractmethod
from typing import List

from app.models.document import Document
from app.models.chunk import Chunk
from app.chunkers.base import Chunker

class FixedSize(Chunker):

    def __init__(self, chunk_size: int = 500):
        self.chunk_size = chunk_size 

    def split(self, documents: List[Document]):
        chunks = []

        for document in documents:

            content = document.content
            metadata = document.metadata.copy()
            #refrain modifying source metadata

            start_index = 0
            for i in range(0, len(content), self.chunk_size):
                last_index = (start_index + self.chunk_size)
                last_index = len(content) if last_index >= len(content) else last_index

                text = content[start_index:last_index]

                start_index = last_index

                metadata["start"] = start_index
                metadata["end"] = last_index

                chunks.append(
                    Chunk(
                        text=text,
                        metadata= metadata
                    )
                )

        return chunks