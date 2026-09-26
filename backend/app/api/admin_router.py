from fastapi import (APIRouter, UploadFile, File, BackgroundTasks)
from app.services.document_service import DocumentService
from uuid import uuid4


router = APIRouter(prefix="/admin/documents", tags=["Admin Documents"])

@router.post("/upload")
async def upload_document(file : UploadFile = File(...)):
    result = await DocumentService.upload(file)
    return result

@router.post("/ingest")
def ingest_documents(background_task : BackgroundTasks):
    background_task.add_task(DocumentService.ingest())
    return {
        "status": "ingestion started"
    }

