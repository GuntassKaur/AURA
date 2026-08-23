import os
import time
import uuid
import tempfile
from typing import Tuple, Optional
import fitz  # PyMuPDF
from sqlalchemy.orm import Session
from models.document import Document
from models.enums import ProcessingStatus
from services.storage_service import get_supabase_client, SUPABASE_BUCKET_NAME

# Global lazy initializer placeholder for PaddleOCR
# PaddleOCR loads weights and models on startup, which is slow.
# We initialize it only when the first OCR request arrives.
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        from paddleocr import PaddleOCR
        # Initialize PaddleOCR engine
        # use_angle_cls=True enables orientation/slanted text correction
        # show_log=False keeps console logging clean
        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return _ocr_engine


class OcrService:
    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> str:
        """
        Runs PaddleOCR on raw image bytes.
        Saves the image temporarily to a temp file to ensure stable loading.
        """
        ocr = get_ocr_engine()
        
        # Write bytes to temporary file for PaddleOCR to read
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name

        try:
            # Run OCR on the temporary image file
            result = ocr.ocr(temp_path, cls=True)
            
            extracted_lines = []
            if result and result[0]:
                for line in result[0]:
                    text_line = line[1][0]
                    extracted_lines.append(text_line)
            
            return "\n".join(extracted_lines)
            
        finally:
            # Ensure temporary file is deleted
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Converts each page of a PDF document into a high-DPI image 
        using PyMuPDF, then runs OCR on each page.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        all_pages_text = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Convert page to high-res PNG image (150 DPI matches text clarity standard)
            pix = page.get_pixmap(dpi=150)
            image_bytes = pix.tobytes("png")
            
            page_text = OcrService.extract_text_from_image(image_bytes)
            if page_text.strip():
                all_pages_text.append(f"--- Page {page_num + 1} ---\n{page_text}")
                
        return "\n\n".join(all_pages_text)

    @classmethod
    def process_document(cls, document_id: uuid.UUID, db: Session) -> Tuple[int, float]:
        """
        Downloads file from Supabase storage, runs OCR, updates PostgreSQL metadata,
        and manages status states.
        
        Returns:
            Tuple[int, float]: (number of characters extracted, processing time in seconds)
        """
        start_time = time.time()
        
        # 1. Fetch document metadata
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.deleted_at == None
        ).first()
        
        if not document:
            raise ValueError(f"Document with ID {document_id} not found.")

        # Update status to processing
        document.processing_status = ProcessingStatus.PROCESSING
        db.commit()

        try:
            # 2. Download raw file bytes from Supabase Storage
            try:
                client = get_supabase_client()
                file_bytes = client.storage.from_(SUPABASE_BUCKET_NAME).download(
                    document.storage_path
                )
            except Exception as se:
                raise RuntimeError(f"Failed to download file from Supabase: {str(se)}")

            # 3. Detect file format and run OCR
            is_pdf = document.mime_type.lower() == "application/pdf" or document.title.lower().endswith(".pdf")
            
            if is_pdf:
                extracted_text = cls.extract_text_from_pdf(file_bytes)
            else:
                extracted_text = cls.extract_text_from_image(file_bytes)

            # 4. Save metadata back to PostgreSQL
            processing_time = time.time() - start_time
            document.extracted_text = extracted_text
            document.processing_status = ProcessingStatus.COMPLETED
            db.commit()
            
            return len(extracted_text), processing_time

        except Exception as e:
            db.rollback()
            # Log failure in DB
            document.processing_status = ProcessingStatus.FAILED
            document.error_message = str(e)
            db.commit()
            raise e
