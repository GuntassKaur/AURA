import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.photo import PhotoUploadResponse, PhotoAnalysisResponse
from services.photo_service import PhotoService

router = APIRouter(
    prefix="/photos",
    tags=["Photos"]
)

@router.post("/upload", response_model=PhotoUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    user_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads a photo. Extracts metadata from image EXIF (GPS, Captured Date),
    automatically links it to memory events, and uploads the image to Supabase.
    """
    try:
        file_bytes = await file.read()
        db_photo = PhotoService.upload_photo(
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
            user_id=user_id,
            db=db
        )
        return PhotoUploadResponse(
            photo_id=db_photo.id,
            file_url=db_photo.file_url,
            storage_path=db_photo.storage_path,
            captured_date=db_photo.captured_date,
            location=db_photo.location,
            event_id=db_photo.event_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Photo upload pipeline failed: {str(e)}"
        )

@router.post("/{id}/analyze", response_model=PhotoAnalysisResponse, status_code=200)
def analyze_photo(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Triggers Gemini Multimodal Vision to generate a descriptive photo caption
    and updates database metadata.
    """
    try:
        caption, event_id = PhotoService.generate_caption(photo_id=id, db=db)
        
        # Reload photo to fetch EXIF location/GPS parameters
        from models.photo import Photo
        photo = db.query(Photo).filter(Photo.id == id).first()
        
        event_title = None
        if event_id:
            from models.memory_event import MemoryEvent
            evt = db.query(MemoryEvent).filter(MemoryEvent.id == event_id).first()
            if evt:
                event_title = evt.title

        return PhotoAnalysisResponse(
            photo_id=id,
            caption=caption,
            latitude=photo.latitude,
            longitude=photo.longitude,
            captured_date=photo.captured_date,
            event_id=event_id,
            event_title=event_title
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI photo analysis failed: {str(e)}"
        )
