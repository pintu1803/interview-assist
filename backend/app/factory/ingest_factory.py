from app.config.settings import settings
from app.loaders.pdf_loader import PDFLoader
from app.chunkers.recursive_chunker import RecursiveChunker
from app.embeddings.sentence_transformer import SentenceTransformerEmbedding
from app.vectorstore.chroma_vector_store import ChromaVectorStore
from app.services.ingestion_service import IngestionService 


def create_ingest_service():
    """This is the factory design pattern.
    We are not using if-else nested blocks here in order to create objects of specific types.
    We are creating objects like hardcoding and creating the intestion service object using them."""

    doc_loader = PDFLoader()
    print("Pdf document loader loaded..")

    doc_chunker = RecursiveChunker(chunk_size=settings.chunk_size, overlap=settings.overlap_size)
    print("Recursive chunker loaded..")

    embedding_model = SentenceTransformerEmbedding(settings.embedding_model, settings.hf_cache_dir)
    print("Sentence transformer embedding model loaded..")

    vector_store = ChromaVectorStore(settings.vector_db_path, settings.db_collection_name)
    print("Chroma db vector store chosen..")
    vector_store.reset()

    print("Returning the ingestion object with doc loader, chunker, embedder and vector db configured..")
    return IngestionService(doc_loader, doc_chunker, embedding_model, vector_store)