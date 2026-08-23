import io
import uuid
import datetime
import logging
from typing import Optional, Tuple, Dict, Any
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from sqlalchemy.orm import Session
from models.photo import Photo
from models.memory_event import MemoryEvent
from services.storage_service import get_supabase_client, SUPABASE_BUCKET_NAME, StorageService
from services.gemini_service import get_gemini_client
from decimal import Decimal

logger = logging.getLogger(__name__)

class PhotoService:
    @staticmethod
    def _extract_exif_metadata(image_bytes: bytes) -> Tuple[Optional[datetime.datetime], Optional[Decimal], Optional[Decimal]]:
        """
        Extracts capture timestamp and GPS coordinates (lat/long) from raw image EXIF.
        """
        captured_date = None
        latitude = None
        longitude = None

        try:
            img = Image.open(io.BytesIO(image_bytes))
            exif_data = img._getexif()

            if exif_data:
                exif = {TAGS.get(tag, tag): value for tag, value in exif_data.items()}
                
                # 1. Parse Capture Date
                date_str = exif.get("DateTimeOriginal") or exif.get("DateTime")
                if date_str:
                    try:
                        # EXIF date format is YYYY:MM:DD HH:MM:SS
                        captured_date = datetime.datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S").replace(tzinfo=datetime.timezone.utc)
                    except ValueError:
                        pass

                # 2. Parse GPS Coordinates
                gps_info = exif.get("GPSInfo")
                if gps_info:
                    gps_tags = {GPSTAGS.get(t, t): gps_info[t] for t in gps_info}
                    
                    # Helper to convert GPS rational degree values to floats
                    def to_decimal_degrees(value) -> Optional[float]:
                        if not value:
                            return None
                        d = float(value[0])
                        m = float(value[1])
                        s = float(value[2])
                        return d + (m / 60.0) + (s / 3600.0)

                    lat_ref = gps_tags.get("GPSLatitudeRef")
                    lat_val = gps_tags.get("GPSLatitude")
                    lon_ref = gps_tags.get("GPSLongitudeRef")
                    lon_val = gps_tags.get("GPSLongitude")

                    if lat_val and lon_val:
                        lat = to_decimal_degrees(lat_val)
                        lon = to_decimal_degrees(lon_val)
                        
                        if lat is not None and lon is not None:
                            if lat_ref == "S":
                                lat = -lat
                            if lon_ref == "W":
                                lon = -lon
                            
                            # Convert to Decimal for database Numeric format matches
                            latitude = Decimal(str(round(lat, 6)))
                            longitude = Decimal(str(round(lon, 6)))
                            
        except Exception as e:
            logger.warning(f"Failed to extract EXIF headers: {e}")

        return captured_date, latitude, longitude

    @staticmethod
    def _auto_link_to_memory_event(
        user_id: uuid.UUID,
        captured_date: Optional[datetime.datetime],
        latitude: Optional[Decimal],
        longitude: Optional[Decimal],
        db: Session
    ) -> Optional[uuid.UUID]:
        """
        Attempts to automatically assign an event_id to a photo using temporal-spatial proximity.
        """
        if not captured_date:
            return None

        # Query events occurring within +/- 2 days of photo capture date
        start_range = captured_date - datetime.timedelta(days=2)
        end_range = captured_date + datetime.timedelta(days=2)

        events = db.query(MemoryEvent).filter(
            MemoryEvent.user_id == user_id,
            MemoryEvent.deleted_at == None,
            MemoryEvent.event_date >= start_range,
            MemoryEvent.event_date <= end_range
        ).all()

        if not events:
            return None

        # If spatial coordinates are present, select the nearest event
        if latitude and longitude:
            for event in events:
                if event.latitude and event.longitude:
                    # Simple coordinate distance calculation (Euclidean approximation)
                    dist = ((event.latitude - latitude) ** 2 + (event.longitude - longitude) ** 2) ** Decimal("0.5")
                    if dist <= Decimal("0.1"):  # approx 10km proximity limit
                        return event.id

        # Fallback to temporal match (return first event in time range)
        return events[0].id

    @classmethod
    def upload_photo(
        cls,
        file_bytes: bytes,
        filename: str,
        content_type: str,
        user_id: uuid.UUID,
        db: Session
    ) -> Photo:
        """
        Validates file size, extracts EXIF, uploads photo to Supabase storage,
        runs automatic memory event linking, and saves metadata in PostgreSQL.
        """
        # 1. Validate constraints using StorageService helpers
        StorageService.validate_file(file_bytes, filename, content_type)
        
        # 2. Extract EXIF properties
        captured_date, lat, lon = cls._extract_exif_metadata(file_bytes)
        
        # Check for existing photo duplicate using checksum
        checksum = StorageService.calculate_checksum(file_bytes)
        existing = db.query(Photo).filter(
            Photo.user_id == user_id,
            Photo.checksum == checksum,
            Photo.deleted_at == None
        ).first()

        if existing:
            return existing

        # 3. Upload photo file to storage bucket
        unique_id = uuid.uuid4()
        storage_path = f"{str(user_id)}/photos/{str(unique_id)}_{filename}"
        
        try:
            client = get_supabase_client()
            client.storage.from_(SUPABASE_BUCKET_NAME).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            file_url = client.storage.from_(SUPABASE_BUCKET_NAME).get_public_url(storage_path)
        except Exception as e:
            raise RuntimeError(f"Storage photo upload failed: {e}")

        # 4. Auto-link to memory event
        event_id = cls._auto_link_to_memory_event(user_id, captured_date, lat, lon, db)

        # 5. Insert photo metadata row into PostgreSQL
        db_photo = Photo(
            user_id=user_id,
            event_id=event_id,
            file_url=file_url,
            storage_path=storage_path,
            mime_type=content_type,
            file_size=len(file_bytes),
            checksum=checksum,
            captured_date=captured_date,
            location=filename.split(".")[0], # default to filename
            latitude=lat,
            longitude=lon
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)

        return db_photo

    @classmethod
    def generate_caption(cls, photo_id: uuid.UUID, db: Session) -> Tuple[str, Optional[uuid.UUID]]:
        """
        Downloads the photo, calls Gemini Multimodal API with image bytes to generate
        a brief description caption, and updates the photo location/details context.
        """
        photo = db.query(Photo).filter(Photo.id == photo_id, Photo.deleted_at == None).first()
        if not photo:
            raise ValueError(f"Photo with ID {photo_id} not found.")

        try:
            # 1. Download file bytes
            client = get_supabase_client()
            photo_bytes = client.storage.from_(SUPABASE_BUCKET_NAME).download(photo.storage_path)
            
            # 2. Convert to PIL Image for multimodal prompt
            pil_image = Image.open(io.BytesIO(photo_bytes))
        except Exception as e:
            raise RuntimeError(f"Failed to fetch photo content: {e}")

        # 3. Call Gemini
        ai = get_gemini_client()
        prompt = "Provide a concise caption for this photo (maximum 30 words) summarizing what it shows."
        
        try:
            response = ai.models.generate_content(
                model="gemini-2.5-flash",
                contents=[pil_image, prompt]
            )
            caption = response.text.strip()
        except Exception as e:
            logger.error(f"Gemini photo captioning failed: {e}")
            raise RuntimeError(f"AI caption generation failed: {e}")

        # 4. Update photo metadata in PostgreSQL
        # Save caption into the location/name attribute for catalog search
        photo.location = caption
        db.commit()

        return caption, photo.event_id
