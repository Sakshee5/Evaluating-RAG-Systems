from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

class Configuration(BaseModel):
    id: str
    name: str
    session_id: str
    created_at: datetime
    chunking_strategy: str
    chunk_size: int
    embedding_model: str
    similarity_metric: str
    num_chunks: int