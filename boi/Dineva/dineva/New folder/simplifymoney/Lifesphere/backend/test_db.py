"""
LifeSphere AI — Database Connection Test Script
Runs a fast query against Supabase to verify connectivity before booting the API.
"""

import sys
from sqlalchemy import text
from utils.database import engine

def test_connection():
    print("Connecting to Supabase Database...")
    try:
        # Establish a connection and run a simple test query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()
            
            if value == 1:
                print("[OK] Connection successful!")
                print(f"Server host: {engine.url.host}")
                print(f"Database name: {engine.url.database}")
            else:
                print("[ERROR] Connection succeeded, but returned unexpected output.")
                sys.exit(1)
                
    except Exception as e:
        print("[ERROR] Connection failed!")
        print(f"Detailed Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
