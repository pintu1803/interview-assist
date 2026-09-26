
from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.chat_router import router as chat_router

# from backend.ingest import main

app = FastAPI(
    title="GenAI Interview Prep Platform"
)

app.include_router(health_router)
app.include_router(chat_router)
