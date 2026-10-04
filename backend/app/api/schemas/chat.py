from pydantic import (BaseModel, Field)

MAX_QUERY_CHARS = 1000

class AskRequest(BaseModel):
    question: str = Field(..., max_length=MAX_QUERY_CHARS)



class AskResponse(BaseModel):
    answer: str