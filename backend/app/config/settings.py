
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    app_name: str
    environment: str
    hf_home: str
    hf_cache_dir: str
    embedding_model: str
    gemini_api_key: str
    gemini_model: str
    vector_db_path: str
    embedding_dimension: int

    # class Config: 
    #     env_file = ".env"
    model_config = SettingsConfigDict(
        env_file = BASE_DIR / ".env"
    )

settings = Settings()

#this can be imported as from app.config.settings.py import settings
