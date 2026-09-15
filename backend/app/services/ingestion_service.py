from typing import List

from app.loaders.base import DocumentLoader
from app.chunkers.base import Chunker
from app.embeddings.base import EmbeddingModel
from app.vectorstore.base import VectorStore


class IngestionService:
    """Interfaces are used here!
    To create the object of ingestion service, we are using the objects of parent types (interfaces)
    While the factory call provides the object of specific types for each component.
    This class remains unaffected by the future changes in any of the components. """

    def __init__(
        self,
        loader: DocumentLoader,
        chunker: Chunker,
        embedding_model: EmbeddingModel,
        vector_store: VectorStore
    ):
        self.loader = loader
        self.chunker = chunker
        self.embedding_model = embedding_model
        self.vector_store = vector_store


    def ingest(self, path: str):

        # 1. Load document
        documents = self.loader.load(path)
        print("Ingest: document loaded")

        # 2. Split into chunks
        chunks = self.chunker.chunk(documents)
        print("Ingest: chunk split")

        # 3. Create embeddings
        texts = [chunk.text for chunk in chunks]
        print("Ingest: text done")
        print(f"Number of chunks: {len(texts)}")
        print("Total characters:", sum(len(t) for t in texts))

        embeddings = (
            self.embedding_model.embed(
                texts
            )
        )
        print("Ingest: chunk done")

        # 4. Store vectors + chunks
        self.vector_store.store(chunks, embeddings)
        print("Ingest: db store done")