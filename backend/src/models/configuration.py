from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

class Configuration(BaseModel):
    id: Optional[str] = None
    session_id: Optional[str] = None
    chunking_strategy: Optional[str] = None
    token_size: Optional[int] = None
    sentence_size: Optional[int] = None
    paragraph_size: Optional[int] = None
    page_size: Optional[int] = None
    embedding_model: Optional[str] = None
    similarity_metric: Optional[str] = None
    num_chunks: Optional[int] = None