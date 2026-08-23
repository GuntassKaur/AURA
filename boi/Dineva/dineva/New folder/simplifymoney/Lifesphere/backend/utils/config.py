import os
from dotenv import load_dotenv

# Ensure env vars are loaded
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Validate critical properties on start
if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL environment variable.")
if not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_KEY environment variable.")
if not DATABASE_URL:
    raise ValueError("Missing DATABASE_URL environment variable.")

# Bucket details
SUPABASE_BUCKET_NAME = "documents"
