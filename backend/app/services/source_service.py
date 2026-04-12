from pathlib import Path

from fastapi import HTTPException, status

from app.core.db import get_conn

IGNORED_NAMES = {
    ".git",
    ".idea",
    ".vscode",
    "__pycache__",
    "node_modules",
    ".venv",
    "dist",
    "build",
}

TEXT_FILE_SUFFIXES = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".txt",
    ".css",
    ".html",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".env",
    ".sql",
    ".sh",
}


def get_project_record(project_id: str) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id, name, status, created_at, file_count, extract_path
            FROM projects
            WHERE id = ?
            """,
            (project_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return dict(row)


def _should_ignore(path: Path) -> bool:
    return any(part in IGNORED_NAMES for part in path.parts)


def _build_node(path: Path, root: Path) -> dict | None:
    if _should_ignore(path.relative_to(root)):
        return None

    relative_path = "." if path == root else path.relative_to(root).as_posix()

    if path.is_dir():
        children: list[dict] = []
        for child in sorted(path.iterdir(), key=lambda item: (item.is_file(), item.name.lower())):
            node = _build_node(child, root)
            if node is not None:
                children.append(node)

        return {
            "name": path.name if path != root else root.name,
            "path": relative_path,
            "type": "directory",
            "children": children,
        }

    return {
        "name": path.name,
        "path": relative_path,
        "type": "file",
        "children": [],
    }


def build_project_tree(project_id: str) -> dict:
    project = get_project_record(project_id)
    root = Path(project["extract_path"]).resolve()

    if not root.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extracted project content not found.",
        )

    tree = _build_node(root, root)
    if tree is None:
        tree = {
            "name": root.name,
            "path": ".",
            "type": "directory",
            "children": [],
        }

    return {
        "project_id": project_id,
        "root": tree,
    }


def _resolve_project_file(project_id: str, relative_path: str) -> Path:
    project = get_project_record(project_id)
    root = Path(project["extract_path"]).resolve()
    candidate = (root / relative_path).resolve()

    if not str(candidate).startswith(str(root)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project path.",
        )

    if not candidate.exists() or not candidate.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source file not found.",
        )

    if _should_ignore(candidate.relative_to(root)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source file not available.",
        )

    return candidate


def read_project_source(project_id: str, relative_path: str) -> dict:
    source_path = _resolve_project_file(project_id, relative_path)

    if source_path.suffix.lower() not in TEXT_FILE_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only supported text source files can be previewed.",
        )

    try:
        content = source_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = source_path.read_text(encoding="utf-8", errors="replace")

    return {
        "project_id": project_id,
        "path": relative_path,
        "content": content,
    }
