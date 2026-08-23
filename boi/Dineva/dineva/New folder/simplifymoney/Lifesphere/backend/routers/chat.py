import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.chat import ChatQueryRequest, ChatQueryResponse
from services.rag_service import RagService

router = APIRouter(
    prefix="/chat",
    tags=["Chat / RAG"]
)

@router.post("/query", response_model=ChatQueryResponse, status_code=200)
def query_rag(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Query the document vault using Retrieval-Augmented Generation (RAG).
    Embeds the query, searches pgvector chunks, and returns an AI grounded response.
    """
    try:
        results = RagService.query_vault(
            user_id=payload.user_id,
            query=payload.query,
            db=db
        )
        return ChatQueryResponse(
            answer=results["answer"],
            sources=results["sources"],
            memory_events=results["memory_events"],
            documents=results["documents"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat query execution failed: {str(e)}"
        )
