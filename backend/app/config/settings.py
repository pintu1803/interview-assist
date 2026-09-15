
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    environment: str
    hf_home: str
    hf_cache_dir: str
    embedding_model: str
    gemini_api_key: str
    vector_db_path: str
    embedding_dimension: int

    class Config: 
        env_file = ".env"

settings = Settings()

#this can be imported as from app.config.settings.py import settings
