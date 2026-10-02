from pathlib import Path
import shutil
from app.config.settings import settings
import ingest
from fastapi import (UploadFile, HTTPException)
from fastapi.concurrency import run_in_threadpool

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}  # match what your loaders support

#fetch doc storage dir path
UPLOAD_DIR = Path(settings.doc_storage)

class DocumentService:

    @classmethod
    def _save(cls, file: UploadFile, file_path: Path) -> None:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    @classmethod
    async def upload(cls, file: UploadFile):
        safe_name = Path(file.filename or "").name
        if not safe_name or Path(safe_name).suffix.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        file_path = (UPLOAD_DIR / safe_name).resolve()
        if UPLOAD_DIR.resolve() not in file_path.parents:
            raise HTTPException(status_code=400, detail="Invalid filename")

        await run_in_threadpool(cls._save, file, file_path)

        return {"message": "uploaded", "filename": safe_name}

    @classmethod
    def ingest(cls):

        ingest.main()
        return {
            "message": "ingestion started"
        }
