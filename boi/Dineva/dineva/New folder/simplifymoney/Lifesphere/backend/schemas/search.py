import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SearchResultItem(BaseModel):
    id: uuid.UUID
    type: str # "document", "memory_event", "photo"
    title: str
    snippet: Optional[str] = None # OCR snippet, description preview, etc.
    score: float # Rank score (SQL similarity or hybrid score)
    file_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    total_results: int
