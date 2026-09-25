from app.config.settings import settings
from app.embeddings.sentence_transformer import SentenceTransformerEmbedding
from app.vectorstore.chroma_vector_store import ChromaVectorStore
from app.retriever.vector_retriever import VectorRetriever
from app.llm.gemini import GeminiLLM
from app.llm.chatgpt import OpenAILLM
from app.llm.groq import GroqLLM
from app.prompts.java_prompt import JavaPrompt
from app.services.rag_service import RAGService


def create_rag_service(llm_choice:str="gemini"):

    embedding_model = SentenceTransformerEmbedding(settings.embedding_model, settings.hf_cache_dir)
    print("Sentence transformer embedding model loaded..")

    vector_store = ChromaVectorStore(settings.vector_db_path, settings.db_collection_name)
    print("Chroma db vector store chosen..")

    retriever = VectorRetriever(embedding_model, vector_store)
    print("Vector retriever (embed the query and similarity search in db) module loaded..")

    llm = GeminiLLM(settings.gemini_api_key)

    if llm_choice == "gemini":
        print("Gemini LLM model loaded..")
    elif llm_choice == "openai":
        llm = OpenAILLM(settings.openai_api_key)
        print("OpenAI LLM model loaded..")
    elif llm_choice == "groq":
        llm = GroqLLM(settings.groq_api_key)
        print("Groq LLM model loaded..")

    prompt_builder = JavaPrompt()
    print("Java prompt builder loaded..")

    print("Returning the RAG object with embedder, vectorDB, vectorRetriever, LLM and prompt builder loaded..")
    return RAGService(retriever, prompt_builder, llm)