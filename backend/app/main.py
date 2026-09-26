
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

from app.api.health import router as health_router
from app.api.chat_router import router as chat_router
from app.api.admin_router import router as admin_router

# from backend.ingest import main

app = FastAPI(
    # title="GenAI Interview Prep Platform"
    title="Prism"
)

origins = [settings.frontend_url]

app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(admin_router)
