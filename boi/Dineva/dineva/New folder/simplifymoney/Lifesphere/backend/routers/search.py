import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.search import SearchResponse
from services.search_service import SearchService

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

@router.get("", response_model=SearchResponse, status_code=200)
def search_vault(
    user_id: uuid.UUID = Query(..., description="ID of the user"),
    query: str = Query(..., description="The search string to query"),
    limit: int = Query(10, ge=1, le=50, description="Limit search results count"),
    db: Session = Depends(get_db)
):
    """
    Search across Documents, Photos, and Memory Events using relational metadata
    and pgvector similarity indices combined in a unified ranked hybrid result.
    """
    try:
        return SearchService.hybrid_search(
            user_id=user_id,
            query=query,
            db=db,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Hybrid search failed: {str(e)}"
        )
