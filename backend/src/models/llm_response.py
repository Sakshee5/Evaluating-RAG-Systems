from pydantic import BaseModel
from typing import List

class Chunk(BaseModel):
    chunk_number: int
    text: str
    relevance_score: float
    similarity_score: float

class LLMResponse(BaseModel):
    question: str
    answer: str
    chunks: List[Chunk]
    visualization_plot: str

    