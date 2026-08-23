"""
Diagnostic script to inspect and verify database tables in Supabase.
"""

from sqlalchemy import inspect
from utils.database import engine

def verify():
    print("Inspecting Supabase database tables...")
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\nFound tables in database:")
        expected_tables = ["users", "documents", "photos", "memory_events", "utility_records", "reminders", "alembic_version"]
        
        for table in expected_tables:
            if table in tables:
                columns = [col["name"] for col in inspector.get_columns(table)]
                print(f"  [OK] Table '{table}' exists. Columns: {', '.join(columns)}")
            else:
                print(f"  [MISSING] Table '{table}' not found!")
                
        print("\nDatabase verification complete.")
        
    except Exception as e:
        print(f"Failed to inspect database: {e}")

if __name__ == "__main__":
    verify()
