from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

class Document(BaseModel):
    id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    file_extension: str
    session_id: str
    created_at: datetime
    processed: bool = False
    chunk_size: Optional[int] = None
    chunking_strategy: Optional[str] = None
    embedding_model: Optional[str] = None
    embeddings_file: Optional[str] = None
    similarity_metric: Optional[str] = None
    

