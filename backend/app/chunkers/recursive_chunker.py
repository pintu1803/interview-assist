from typing import List

from app.models.document import Document
from app.models.chunk import Chunk
from app.chunkers.base import Chunker
from app.config.types import ChunkMetadata

class RecursiveChunker(Chunker):

    def __init__(self, chunk_size:int = 500, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    #################################
    def chunk(self, documents: List[Document]) -> List[Chunk]:
        result = []
        separators = ["\n\n", "\n", ".", ""]

        for document in documents:
            content = document.content
        
            pieces = self._split(content, separators)
            merged_chunks = self._merge_chunks(pieces)

            for index, text in enumerate(merged_chunks):
                doc_metadata = document.metadata.copy()
                metadata: ChunkMetadata = {"source":doc_metadata["source"], 
                                           "type":doc_metadata["type"], 
                                           "chunk_id":index}
                
                result.append(
                    Chunk(
                        text = text,
                        metadata = metadata
                    )
                )

        return result

    #################################
    def _split(self, content: str, separators: List[str]) -> List[str]:
        result = []

        #if the document itself is small
        if len(content) <= self.chunk_size:
            return [content]

        #if no separator is mentioned
        if not separators or separators[0] == "":
            for i in range(0, len(content), self.chunk_size):
                end_index = i + self.chunk_size
                end_index = end_index if end_index < len(content) else len(content)
                result.append(content[i:end_index])
            return result

        #now split using separator first
        separator = separators[0]
        parts = content.split(separator)
        pieces = [part + separator for part in parts[:-1]] + [parts[-1]]

        for piece in pieces:
            if len(piece) <= self.chunk_size:
                result.append(piece)
            else:
                result.extend(self._split(piece, separators[1:]))

        #final return
        return result

    #################################
    def _merge_chunks(self, pieces: List[str]) -> List[str]:
        chunks = []

        current = ""

        for piece in pieces:
            if len(current) + len(piece) < self.chunk_size:
                current += piece + " "
            else:
                chunks.append(current.strip())
                overlap_text = current[-self.overlap:] #retain the overlap text from prev. chunk
                current = overlap_text + " " + piece + " "

        #if at the end current holds some text
        if current:
            chunks.append(current.strip())

        #return the merged list
        return chunks
            