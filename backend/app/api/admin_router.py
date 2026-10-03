from fastapi import (APIRouter, UploadFile, File)
from app.services.document_service import DocumentService
from uuid import uuid4


router = APIRouter(prefix="/admin/documents", tags=["Admin Documents"])

@router.post("/upload")
async def upload_document(file : UploadFile = File(...)):
    result = await DocumentService.upload(file)
    return result

@router.post("/ingest")
def ingest_documents():
    return DocumentService.ingest

