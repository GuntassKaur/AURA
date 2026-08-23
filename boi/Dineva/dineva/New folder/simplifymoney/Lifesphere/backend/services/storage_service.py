import uuid
import hashlib
from typing import Tuple, Dict, Any
from supabase import create_client, Client
from utils.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET_NAME

# Lazy initializer helper for Supabase Client to prevent server startup crash 
# when credentials/keys are placeholders in local environment.
_supabase_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            raise RuntimeError(
                f"Failed to initialize Supabase storage client. Please check SUPABASE_KEY in .env: {str(e)}"
            )
    return _supabase_client

# Define file validation constants
# 10 MB maximum upload limit (in bytes)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

# Allowed Mime Types
ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpeg",
    "image/jpg": ".jpg"
}

class StorageService:
    @staticmethod
    def calculate_checksum(file_bytes: bytes) -> str:
        """
        Computes the SHA-256 hash checksum of raw file bytes.
        This will be used for indexing and file de-duplication checks.
        """
        sha256_hash = hashlib.sha256()
        sha256_hash.update(file_bytes)
        return sha256_hash.hexdigest()

    @staticmethod
    def validate_file(file_bytes: bytes, filename: str, content_type: str) -> str:
        """
        Validates file size constraints and checks if the mime-type is supported.
        Returns the clean file extension if valid; raises ValueError if invalid.
        """
        # Validate File Size
        file_size = len(file_bytes)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File size exceeds limit of 10MB. Uploaded: {file_size / (1024 * 1024):.2f}MB"
            )

        # Validate MIME Type (Content Type)
        # Some systems send lowercase or uppercase; strip whitespace
        mime = content_type.lower().strip()
        
        # Fallback check on file extension if mime type is generic binary stream
        if mime not in ALLOWED_MIME_TYPES:
            # Check extension to decide if it's generic octet-stream mapping to pdf/images
            ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
            matched_mime = None
            for key, val in ALLOWED_MIME_TYPES.items():
                if val == ext:
                    matched_mime = key
                    break
            
            if not matched_mime:
                raise ValueError(
                    f"Unsupported file type: {content_type}. Only PDF, PNG, JPG, JPEG are allowed."
                )
            mime = matched_mime

        return ALLOWED_MIME_TYPES[mime]

    @classmethod
    def upload_document(
        cls, 
        file_bytes: bytes, 
        filename: str, 
        content_type: str, 
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        """
        Validates, checksums, and uploads file bytes directly to Supabase storage.
        
        Returns a dict containing:
            - file_url: The public access url of the file.
            - storage_path: The unique object key in the bucket.
            - checksum: The SHA-256 validation hash.
            - file_size: Size in bytes.
            - mime_type: Verified content type.
        """
        # 1. Validate file constraints
        ext = cls.validate_file(file_bytes, filename, content_type)
        
        # Clean file name of spaces and special chars
        clean_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
        if not clean_filename:
            clean_filename = "document" + ext
            
        # 2. Generate unique storage key: {user_id}/{uuid4}_{clean_filename}
        unique_id = uuid.uuid4()
        storage_path = f"{str(user_id)}/{str(unique_id)}_{clean_filename}"
        
        # 3. Compute checksum
        checksum = cls.calculate_checksum(file_bytes)
        
        try:
            client = get_supabase_client()
            # 4. Upload file to Supabase Storage Bucket
            client.storage.from_(SUPABASE_BUCKET_NAME).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            
            # 5. Retrieve public access url
            # Note: Ensure the bucket "documents" is created as PUBLIC in Supabase Dashboard
            file_url = client.storage.from_(SUPABASE_BUCKET_NAME).get_public_url(storage_path)
            
            return {
                "file_url": file_url,
                "storage_path": storage_path,
                "checksum": checksum,
                "file_size": len(file_bytes),
                "mime_type": content_type
            }
            
        except Exception as e:
            # Log exact exception parameters and raise a generic user-facing storage error
            raise RuntimeError(f"Supabase Storage Upload failed: {str(e)}")
