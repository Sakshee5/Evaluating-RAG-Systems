from pydantic import BaseModel
from typing import Optional

class Question(BaseModel):
    id: Optional[str]
    question_string: str
    session_id: str
