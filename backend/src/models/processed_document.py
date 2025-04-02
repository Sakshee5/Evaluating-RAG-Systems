from pydantic import BaseModel
from typing import Optional

class ProcessedDocument(BaseModel):
    id: Optional[str]
    file_name: Optional[str]
    full_text: Optional[str]
    pages: Optional[list]
    chunks: Optional[list]
    embeddings: Optional[list]
    chunking_strategy: Optional[str]
    token_size: Optional[int]
    sentence_size: Optional[int]
    paragraph_size: Optional[int]
    page_size: Optional[int]
    embedding_model: Optional[str]
