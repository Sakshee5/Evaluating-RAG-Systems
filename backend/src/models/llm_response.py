from pydantic import BaseModel
from typing import List

class Chunk(BaseModel):
    chunk_number: int
    text: str
    relevance_score: float
    similarity_score: float

class RUSMetrics(BaseModel):
    rus: float
    normalized_dcr: float
    scaled_correlation: float
    wasted_similarity_penalty: float

class LLMResponse(BaseModel):
    question: str
    answer: str
    chunks: List[Chunk]
    visualization_plot: List[str]
    rus_metrics: RUSMetrics
    