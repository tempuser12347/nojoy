from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sys, os


# Determine database path
if getattr(sys, "frozen", False):
    # Running as PyInstaller exe
    base_path = os.path.dirname(sys.executable)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(base_path, 'dhoDatabase.sqlite3')}"
else:
    # Development
    base_path = os.path.dirname(__file__)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(base_path, '../../dhoDatabase.sqlite3')}"

# SQLALCHEMY_DATABASE_URL = "sqlite:///../dhoDatabase.sqlite3"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()