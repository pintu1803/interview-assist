
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

origins = [settings.prod_frontend_url, settings.dev_frontend_url]

print("CORS origins:", origins)
print("Frontend is exposed at ", settings.prod_frontend_url)

app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(admin_router)


####################################
# After every git push, run in aws:
# connect EC2 instance
# sudo su - ubuntu
# cd prism
# source .venv/bin/activate  
# cd /home/ubuntu/prism/backend
# git pull
# sudo systemctl restart prism  # restart
# journalctl -u prism -f   # see live logs as on console
# curl http://127.0.0.1:8000/health
# curl https://java-prism-ai.duckdns.org/health     
####################################