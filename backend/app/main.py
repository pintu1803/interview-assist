
from fastapi import FastAPI
from app.api.health import router as health_router

from backend.ingest import main

app = FastAPI(
    title="GenAI Interview Prep Platform"
)

app.include_router(health_router)

@app.post("/ask")
def ask():
    main("D:/Projects/python/ai-lab/interview-assist/backend/knowledge_base/java/jvmti.html")