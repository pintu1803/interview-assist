from fastapi import APIRouter
from app.api.schemas.chat import (AskRequest, AskResponse)
from app.factory.rag_factory import create_rag_service

#load only once at startup
rag_service = create_rag_service()

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/ask", response_model=AskResponse)
def ask_question(request : AskRequest):

    #extract query from request and pass to inference engine
    answer = rag_service.ask(request.question)

    #wrap the response in AskResponse format and return
    return AskResponse(answer=answer)