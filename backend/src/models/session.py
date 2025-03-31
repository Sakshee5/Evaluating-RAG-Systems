from typing import List
from pydantic import BaseModel
from datetime import datetime

class Session(BaseModel):
    id: str
    created_at: datetime
    documents: List[str]
    questions: List[str]
    configurations: List[str]  # each configuration will be applied to all documents and questions