import uuid
from typing import List
from datetime import datetime
from pydantic import BaseModel
from models.enums import ProcessingStatus

class DocumentUploadResponse(BaseModel):
    document_id: uuid.UUID
    file_url: str
    storage_path: str
    upload_date: datetime
    processing_status: ProcessingStatus

    class Config:
        from_attributes = True

class DocumentOcrResponse(BaseModel):
    document_id: uuid.UUID
    processing_status: ProcessingStatus
    characters_extracted: int
    processing_time_seconds: float

    class Config:
        from_attributes = True

class DocumentAnalysisResponse(BaseModel):
    document_id: uuid.UUID
    category: str
    summary: str
    metadata: dict
    processing_time_seconds: float

    class Config:
        from_attributes = True

class DocumentLinkMemoryResponse(BaseModel):
    document_id: uuid.UUID
    memory_event_id: uuid.UUID
    memory_event_title: str
    created_new_event: bool
    linked_documents: List[str]

    class Config:
        from_attributes = True

class DocumentEmbedResponse(BaseModel):
    document_id: uuid.UUID
    chunks_created: int
    embedding_dimension: int
    processing_time_seconds: float

    class Config:
        from_attributes = True
