from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
EXTRACT_DIR = STORAGE_DIR / "extracted"
DB_PATH = STORAGE_DIR / "app.db"

ALLOWED_UPLOAD_SUFFIXES = {".zip"}
