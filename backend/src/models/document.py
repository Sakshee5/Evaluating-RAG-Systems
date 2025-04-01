from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

class Document(BaseModel):
    id: Optional[str]
    file_name: Optional[str]
    file_path: Optional[str]
    file_type: Optional[str]
    file_size: Optional[int]
    file_extension: Optional[str]
    session_id: Optional[str]
    chunk_size: Optional[int] = None
    chunking_strategy: Optional[str] = None
    embedding_model: Optional[str] = None
    embeddings_file: Optional[str] = None
    similarity_metric: Optional[str] = None
    

