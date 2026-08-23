import uuid
from typing import List, Optional
from pydantic import BaseModel

class ChatQueryRequest(BaseModel):
    user_id: uuid.UUID
    query: str

class SourceChunkResponse(BaseModel):
    document_id: uuid.UUID
    document_title: str
    content: str
    chunk_index: int

class ChatQueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunkResponse]
    memory_events: List[uuid.UUID]
    documents: List[uuid.UUID]

    class Config:
        from_attributes = True
