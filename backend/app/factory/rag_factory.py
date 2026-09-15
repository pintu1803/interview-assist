from app.config.settings import settings
from app.embeddings.sentence_transformer import SentenceTransformerEmbedding
from app.vectorstore.faiss_store import FAISSVectorStore
from app.retriever.vector_retriever import VectorRetriever
from app.llm.gemini import GeminiLLM
from app.prompts.java_prompt import JavaPrompt
from app.services.rag_service import RAGService


def create_rag_service():

    embedding_model = SentenceTransformerEmbedding(settings.embedding_model, settings.hf_cache_dir)

    vector_store = FAISSVectorStore(settings.embedding_dimension)

    retriever = VectorRetriever(embedding_model, vector_store)

    llm = GeminiLLM(settings.gemini_api_key)

    prompt_builder = JavaPrompt()

    return RAGService(retriever, prompt_builder, llm)