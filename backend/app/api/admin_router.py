from fastapi import (APIRouter, UploadFile, File, Depends)
from app.services.document_service import DocumentService
from uuid import uuid4
from app.api.admin_security import require_admin


router = APIRouter(prefix="/admin/documents", 
                   tags=["Admin Documents"],
                   dependencies=[Depends(require_admin)])

@router.post("/upload")
async def upload_document(file : UploadFile = File(...)):
    result = await DocumentService.upload(file)
    return result

@router.post("/ingest")
def ingest_documents():
    return DocumentService.ingest()

