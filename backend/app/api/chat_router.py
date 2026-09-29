from fastapi import APIRouter
from app.api.schemas.chat import (AskRequest, AskResponse)
from app.factory.rag_factory import create_rag_service

from pydantic import BaseModel, EmailStr
from app.services.email_service import send_transcript_email
from fastapi import HTTPException

#load only once at startup
rag_service = create_rag_service()

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/ask", response_model=AskResponse)
def ask_question(request : AskRequest):

    try:
        #extract query from request and pass to inference engine
        answer = rag_service.ask(request.question)

        #wrap the response in AskResponse format and return
        return AskResponse(answer=answer)
    except Exception as e:
        print("ERROR:", repr(e))
        raise

################################
class TranscriptTurn(BaseModel):
    question: str
    answer: str

class EmailTranscriptRequest(BaseModel):
    email: EmailStr
    history: list[TranscriptTurn]

@router.post("/email-transcript")
def email_transcript(payload: EmailTranscriptRequest):  # note: plain def, not async def
    if not payload.history:
        raise HTTPException(status_code=400, detail="No conversation to send yet.")
    try:
        send_transcript_email(
            to_email=payload.email,
            history=[turn.model_dump() for turn in payload.history],
        )
    except Exception as e:
        print("Failed to send transcript email")
        raise HTTPException(status_code=502, detail="Couldn't send the email. Try again shortly.") from e
    return {"status": "sent"}