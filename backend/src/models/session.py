from pydantic import BaseModel
from typing import List, Optional
from models.document import Document
from models.question import Question
from models.configuration import Configuration

class Session(BaseModel):
    id: Optional[str] = None
    documents: List[Document] = []
    questions: List[Question] = []
    configurations: List[Configuration] = []