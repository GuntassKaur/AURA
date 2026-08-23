import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from utils.database import get_db
from models.user import User
from models.document import Document
from models.enums import DocumentType, ProcessingStatus
from schemas.document import (
    DocumentUploadResponse, 
    DocumentOcrResponse, 
    DocumentAnalysisResponse, 
    DocumentLinkMemoryResponse,
    DocumentEmbedResponse
)
from services.storage_service import StorageService
from services.ocr_service import OcrService
from services.gemini_service import GeminiService
from services.memory_event_service import MemoryEventService
from services.embedding_service import EmbeddingService

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    user_id: uuid.UUID = Query(..., description="ID of the user uploading the document"),
    file: UploadFile = File(..., description="PDF, PNG, JPG, or JPEG file under 10MB"),
    db: Session = Depends(get_db)
):
    """
    Uploads a document (PDF or image) to Supabase Storage and records its metadata in PostgreSQL.
    
    If the file is already uploaded by the same user (evaluated by checksum), 
    the existing record is returned immediately to prevent duplicate S3 bloat.
    """
    # 1. Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read upload stream: {str(e)}"
        )
    
    # 2. Checksum validation & Deduplication check
    checksum = StorageService.calculate_checksum(file_bytes)
    
    # Ensure user exists (to prevent Foreign Key violations during initial testing)
    user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
    if not user:
        # Auto-create mock user for smooth developer experience
        user = User(
            id=user_id,
            full_name="Developer Tester",
            email=f"tester_{str(user_id)[:8]}@lifesphere.ai",
            password_hash="mock_hashed_credential"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Search for pre-existing document duplicate
    existing_doc = db.query(Document).filter(
        Document.user_id == user_id,
        Document.checksum == checksum,
        Document.deleted_at == None
    ).first()
    
    if existing_doc:
        # Return matched record instantly (skips S3 upload round-trip)
        return DocumentUploadResponse(
            document_id=existing_doc.id,
            file_url=existing_doc.file_url,
            storage_path=existing_doc.storage_path,
            upload_date=existing_doc.upload_date,
            processing_status=existing_doc.processing_status
        )

    # 3. Perform file constraint validation
    try:
        StorageService.validate_file(file_bytes, file.filename, file.content_type)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    # 4. Upload to Supabase Storage
    try:
        upload_result = StorageService.upload_document(
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
            user_id=user_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5. Insert metadata into PostgreSQL
    try:
        db_doc = Document(
            user_id=user_id,
            title=file.filename,
            document_type=DocumentType.OTHER, # Default placeholder until AI parser runs
            file_url=upload_result["file_url"],
            storage_path=upload_result["storage_path"],
            mime_type=upload_result["mime_type"],
            file_size=upload_result["file_size"],
            checksum=upload_result["checksum"],
            processing_status=ProcessingStatus.PENDING
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return DocumentUploadResponse(
            document_id=db_doc.id,
            file_url=db_doc.file_url,
            storage_path=db_doc.storage_path,
            upload_date=db_doc.upload_date,
            processing_status=db_doc.processing_status
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database transaction failed: {str(e)}"
        )


@router.post("/{document_id}/process", response_model=DocumentOcrResponse, status_code=200)
def process_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Triggers Optical Character Recognition (OCR) using PaddleOCR on the uploaded document.
    Downloads the PDF/image, converts pages, extracts text, and commits the result to the DB.
    """
    try:
        char_count, proc_time = OcrService.process_document(document_id, db)
        
        # Refetch document to return correct verified status
        doc = db.query(Document).filter(Document.id == document_id).first()
        
        return DocumentOcrResponse(
            document_id=document_id,
            processing_status=doc.processing_status,
            characters_extracted=char_count,
            processing_time_seconds=proc_time
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR Processing failed: {str(e)}"
        )


@router.post("/{document_id}/analyze", response_model=DocumentAnalysisResponse, status_code=200)
def analyze_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Analyzes the OCR extracted text using Gemini AI to categorize the document,
    generate a summary, and extract key metadata properties.
    """
    try:
        category, summary, metadata, proc_time = GeminiService.analyze_document(document_id, db)
        
        return DocumentAnalysisResponse(
            document_id=document_id,
            category=category,
            summary=summary,
            metadata=metadata,
            processing_time_seconds=proc_time
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini document analysis failed: {str(e)}"
        )


@router.post("/{document_id}/link-memory", response_model=DocumentLinkMemoryResponse, status_code=200)
def link_document_to_memory(
    document_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Analyzes document metadata to either automatically link it to an existing MemoryEvent
    (using temporal-spatial heuristics) or generate a new event container automatically.
    """
    try:
        event_id, event_title, created_new, linked_docs = MemoryEventService.link_document_to_event(
            document_id, 
            db
        )
        
        return DocumentLinkMemoryResponse(
            document_id=document_id,
            memory_event_id=event_id,
            memory_event_title=event_title,
            created_new_event=created_new,
            linked_documents=linked_docs
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Memory Event linking failed: {str(e)}"
        )


@router.post("/{document_id}/embed", response_model=DocumentEmbedResponse, status_code=200)
def embed_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Splits the document OCR text into semantic chunks and generates
    vector embeddings using the Gemini Embedding API. Stores/regenerates
    chunks inside PostgreSQL pgvector.
    """
    try:
        chunks_count, dim, proc_time = EmbeddingService.process_document(document_id, db)
        
        return DocumentEmbedResponse(
            document_id=document_id,
            chunks_created=chunks_count,
            embedding_dimension=dim,
            processing_time_seconds=proc_time
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document chunking and embedding failed: {str(e)}"
        )



