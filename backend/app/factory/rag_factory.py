from app.config.settings import settings
from app.embeddings.sentence_transformer import SentenceTransformerEmbedding
from app.vectorstore.singleton_vectorstore import get_vector_store
from app.retriever.vector_retriever import VectorRetriever
from app.factory.raranker_factory import create_reranker
from app.factory.llm_factory import create_llm
from app.prompts.java_prompt import JavaPrompt
from app.services.rag_service import RAGService


def create_rag_service(llm_choice:str="gemini"):

    embedding_model = SentenceTransformerEmbedding(settings.embedding_model, settings.hf_cache_dir)
    print("Sentence transformer embedding model loaded..")

    vector_store = get_vector_store()
    print("Chroma db vector store chosen..")

    retriever = VectorRetriever(embedding_model, vector_store)
    print("Vector retriever (embed the query and similarity search in db) module loaded..")

    reranker = create_reranker(settings.reranker_provider)
    print(f"{settings.reranker_provider} Reranker loaded..")

    llm = create_llm()
    print("Fallback LLM models loaded..")

    prompt_builder = JavaPrompt()
    print("Java prompt builder loaded..")

    print("Returning the RAG object with embedder, vectorDB, vectorRetriever, reranker, LLM and prompt builder loaded..")
    return RAGService(retriever, reranker, prompt_builder, llm)