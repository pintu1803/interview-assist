from pathlib import Path
import shutil
from app.config.settings import settings
import ingest
from fastapi import (UploadFile, BackgroundTasks)

#fetch doc storage dir path
UPLOAD_DIR = Path(settings.doc_storage)

#create dir if absent to store documents
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class DocumentService:

    async def upload(self, file: UploadFile):

        file_path = (UPLOAD_DIR / file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        return {
            "message": "uploaded",
            "filename": file.filename
        }


    def ingest(self):

        ingest.main()
        return {
            "message": "ingestion started"
        }
