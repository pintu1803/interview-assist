
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    hf_home_path: str
    hf_cache_path: str
    vector_db: str
    doc_storage_path: str
    ingestion_history_path: str

    app_name: str
    environment: str
    
    embedding_model: str
    gemini_api_key: str
    gemini_model: str
    openai_api_key: str
    openai_model: str
    groq_api_key: str
    groq_model: str
    
    embedding_dimension: int
    db_collection_name: str
    chunk_size: int
    overlap_size: int
    llm_providers: str

    topk: int

    reranker_provider: str
    reranker_model_name: str
    rerank_topk: int

    dev_frontend_url: str
    prod_frontend_url: str

    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    email_from: str

    admin_api_key: str

    @property
    def llm_provider_list(self):
        return [
            provider.strip()
            for provider in self.llm_providers.split(",")
        ]

    @property
    def hf_home(self) -> Path:
        return BASE_DIR / self.hf_home_path

    @property
    def hf_cache_dir(self) -> Path:
        return BASE_DIR / self.hf_cache_path

    @property
    def vector_db_path(self) -> Path:
        return BASE_DIR / self.vector_db

    @property
    def doc_storage(self) -> Path:
        return BASE_DIR / self.doc_storage_path

    @property
    def ingestion_history(self) -> Path:
        return BASE_DIR / self.ingestion_history_path
    
    
    model_config = SettingsConfigDict(
        env_file = ( 
            BASE_DIR / ".env",
            BASE_DIR / ".env.secret"
        )
    )

settings = Settings()

#this can be imported as from app.config.settings.py import settings
