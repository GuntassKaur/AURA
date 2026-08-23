import os
import time
import uuid
import json
import logging
from typing import Tuple, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from models.document import Document
from models.enums import DocumentType
from utils.config import GEMINI_API_KEY

# Set up logging
logger = logging.getLogger(__name__)

# Pydantic schemas for Gemini Structured Output
class GeminiMetadataSchema(BaseModel):
    title: Optional[str] = Field(None, description="Clear, descriptive title for the document")
    vendor: Optional[str] = Field(None, description="Merchant, issuer, vendor, or organization name")
    issue_date: Optional[str] = Field(None, description="The date the document was issued (Format: YYYY-MM-DD)")
    expiry_date: Optional[str] = Field(None, description="The expiry, renewal, or warranty expiration date (Format: YYYY-MM-DD)")
    total_amount: Optional[float] = Field(None, description="The total cost, amount charged, or balance due")
    currency: Optional[str] = Field(None, description="ISO currency code (e.g. INR, USD, EUR)")
    invoice_number: Optional[str] = Field(None, description="The invoice number if present")
    bill_number: Optional[str] = Field(None, description="The bill number or reference ID")
    customer_name: Optional[str] = Field(None, description="Customer or account holder name")
    address: Optional[str] = Field(None, description="Address of the vendor or customer")
    phone: Optional[str] = Field(None, description="Contact phone number(s)")
    email: Optional[str] = Field(None, description="Contact email address(es)")
    website: Optional[str] = Field(None, description="Merchant or vendor website url")
    custom_properties: Optional[Dict[str, str]] = Field(
        None, 
        description="Any custom, specific parameters of interest not captured by standard fields"
    )

class GeminiAnalysisResponse(BaseModel):
    category: str = Field(
        ..., 
        description="Must be one of: invoice, receipt, utility_bill, warranty, medical_report, bank_statement, identity_document, insurance, tax_document, other"
    )
    summary: str = Field(..., description="A concise overview of the document (MAXIMUM 150 words)")
    metadata: GeminiMetadataSchema = Field(..., description="Extracted metadata fields")


# Initialize the Gemini GenAI Client
_genai_client = None

def get_gemini_client() -> genai.Client:
    global _genai_client
    if _genai_client is None:
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
            raise ValueError(
                "Gemini API key is not configured. Please add GEMINI_API_KEY to your backend/.env file."
            )
        _genai_client = genai.Client(api_key=GEMINI_API_KEY)
    return _genai_client


class GeminiService:
    @classmethod
    def _call_gemini_api_with_retry(cls, text_content: str) -> GeminiAnalysisResponse:
        """
        Calls Gemini API with structured JSON output configurations.
        Includes a retry mechanism (retries once on failure).
        """
        client = get_gemini_client()
        
        system_instruction = (
            "You are an expert Document Intelligence processor. Your task is to analyze the "
            "provided OCR text from a personal document and extract key attributes. "
            "Strictly adhere to these rules:\n"
            "1. ONLY extract information that is present in the text.\n"
            "2. If a field is not present or cannot be determined, set it to null. Do not invent or assume values.\n"
            "3. Ensure the summary is concise and does not exceed 150 words.\n"
            "4. Match the category field exactly to one of the provided enum options."
        )

        prompt = f"Analyze the following OCR document text:\n\n{text_content}"

        # Configuration options enabling JSON Mode with Pydantic schema validation
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.0,  # Highly deterministic extraction
            response_mime_type="application/json",
            response_schema=GeminiAnalysisResponse
        )

        attempts = 2
        last_error = None
        
        for attempt in range(attempts):
            try:
                # Using the standard modern gemini-2.5-flash model
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=config
                )
                
                # Parse and validate response JSON using Pydantic
                parsed_response = GeminiAnalysisResponse.model_validate_json(response.text)
                return parsed_response
                
            except Exception as e:
                last_error = e
                logger.warning(
                    f"Gemini API attempt {attempt + 1}/{attempts} failed: {str(e)}. Retrying..."
                )
                if attempt < attempts - 1:
                    time.sleep(1)  # Brief wait before retry
                    
        raise RuntimeError(
            f"Gemini API call failed after {attempts} attempts. Last error: {str(last_error)}"
        )

    @classmethod
    def analyze_document(cls, document_id: uuid.UUID, db: Session) -> Tuple[str, str, Dict[str, Any], float]:
        """
        Retrieves OCR text from PostgreSQL, calls Gemini for structured analysis, 
        saves results, and updates document metadata.
        
        Returns:
            Tuple[str, str, Dict[str, Any], float]: (category, summary, metadata_dict, processing_time)
        """
        start_time = time.time()

        # 1. Fetch document from DB
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.deleted_at == None
        ).first()

        if not document:
            raise ValueError(f"Document with ID {document_id} not found.")

        if not document.extracted_text:
            raise ValueError(
                f"Document with ID {document_id} has no OCR extracted text. Run OCR processing first."
            )

        # 2. Call Gemini API
        try:
            analysis = cls._call_gemini_api_with_retry(document.extracted_text)
        except Exception as e:
            logger.error(f"Failed to analyze document {document_id}: {str(e)}")
            raise e

        # 3. Map category string back to DocumentType ENUM
        # ENUM keys: invoice, receipt, warranty, utility_bill, other
        category_mapping = {
            "invoice": DocumentType.INVOICE,
            "receipt": DocumentType.RECEIPT,
            "utility_bill": DocumentType.UTILITY_BILL,
            "warranty": DocumentType.WARRANTY,
            # Group specific files into OTHER for MVP DB constraints
            "medical_report": DocumentType.OTHER,
            "bank_statement": DocumentType.OTHER,
            "identity_document": DocumentType.OTHER,
            "insurance": DocumentType.OTHER,
            "tax_document": DocumentType.OTHER,
            "other": DocumentType.OTHER
        }
        
        mapped_category = category_mapping.get(analysis.category.lower(), DocumentType.OTHER)
        
        # 4. Save metadata back to PostgreSQL
        processing_time = time.time() - start_time
        
        # Convert Pydantic metadata schema to standard dict for JSONB column
        metadata_dict = analysis.metadata.model_dump(exclude_unset=True)
        
        document.document_type = mapped_category
        document.summary = analysis.summary
        document.metadata_json = metadata_dict
        
        db.commit()

        return analysis.category, analysis.summary, metadata_dict, processing_time
