import shutil
import uuid
import zipfile
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.db import get_conn, utc_now_iso
from app.core.settings import ALLOWED_UPLOAD_SUFFIXES, EXTRACT_DIR, UPLOAD_DIR


def _safe_extract_zip(zip_path: Path, target_dir: Path) -> int:
    file_count = 0
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            out_path = (target_dir / member.filename).resolve()
            if not str(out_path).startswith(str(target_dir.resolve())):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ZIP contains unsafe paths.",
                )

        archive.extractall(target_dir)
        file_count = sum(1 for p in target_dir.rglob("*") if p.is_file())
    return file_count


async def create_project_from_upload(file: UploadFile) -> dict:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ZIP uploads are supported.",
        )

    project_id = str(uuid.uuid4())
    zip_name = f"{project_id}.zip"
    zip_path = UPLOAD_DIR / zip_name
    extract_path = EXTRACT_DIR / project_id
    extract_path.mkdir(parents=True, exist_ok=True)

    with zip_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        file_count = _safe_extract_zip(zip_path=zip_path, target_dir=extract_path)
    except Exception:
        if extract_path.exists():
            shutil.rmtree(extract_path)
        if zip_path.exists():
            zip_path.unlink()
        raise

    record = {
        "id": project_id,
        "name": file.filename or zip_name,
        "status": "uploaded",
        "created_at": utc_now_iso(),
        "zip_path": str(zip_path),
        "extract_path": str(extract_path),
        "file_count": file_count,
    }

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO projects (
                id, name, status, created_at, zip_path, extract_path, file_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["name"],
                record["status"],
                record["created_at"],
                record["zip_path"],
                record["extract_path"],
                record["file_count"],
            ),
        )
        conn.commit()

    return record


def list_projects() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, name, status, created_at, file_count
            FROM projects
            ORDER BY created_at DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]
