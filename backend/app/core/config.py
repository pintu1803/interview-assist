
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "GenAI Interview Assist"

    environment: str = "development"


settings = Settings()
#this can be imported as from app.core.config import settings
