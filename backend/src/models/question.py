from pydantic import BaseModel

class Question(BaseModel):
    id: str
    text: str
    session_id: str
