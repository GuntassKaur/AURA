import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Load the environment variables from the .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "CRITICAL ERROR: DATABASE_URL environment variable is missing in the .env file."
    )

try:
    # 2. Initialize the SQLAlchemy Engine.
    # pool_pre_ping=True: Executes a quick test query (ping) before checking out a connection, 
    # ensuring stale/dropped connections are recycled automatically.
    # pool_size: The number of persistent connections to keep in the pool.
    # max_overflow: The maximum number of temporary connections allowed beyond pool_size.
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    
    # 3. Create the session maker (factory)
    # autocommit=False: Ensures database transactions must be committed explicitly.
    # autoflush=False: Prevents SQLAlchemy from sending query changes to the DB before committing.
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # 4. Create the declarative Base class for ORM Models
    Base = declarative_base()

except Exception as e:
    print(f"Failed to initialize database engine: {e}")
    raise e


# 5. Dependency Injector function for route handlers
def get_db():
    """
    Generates a new database session, yields it to the calling route,
    and guarantees its closure upon request completion, even if errors occur.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
