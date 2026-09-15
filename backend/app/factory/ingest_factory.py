from app.config.settings import settings
from app.loaders.pdf_loader import PDFLoader
from app.chunkers.recursive_chunker import RecursiveChunker
from app.embeddings.sentence_transformer import SentenceTransformerEmbedding
from app.vectorstore.faiss_store import FAISSVectorStore
from app.services.ingestion_service import IngestionService 


def create_ingest_service():
    """This is the factory design pattern.
    We are not using if-else nested blocks here in order to create objects of specific types.
    We are creating objects like hardcoding and creating the intestion service object using them."""

    doc_loader = PDFLoader()
    print("Loaded one")

    doc_chunker = RecursiveChunker(chunk_size=500, overlap=100)
    print("Chunker done")

    embedding_model = SentenceTransformerEmbedding(settings.embedding_model, settings.hf_cache_dir)
    print("Embedding model done")

    vector_store = FAISSVectorStore(settings.embedding_dimension)
    print("Vector store done")

    return IngestionService(doc_loader, doc_chunker, embedding_model, vector_store)