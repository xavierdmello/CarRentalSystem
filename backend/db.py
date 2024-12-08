from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "postgresql://postgres.vyaouigisxpikimgruhe:root1234$@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()  
    try:
        yield db  
    finally:
        db.close()