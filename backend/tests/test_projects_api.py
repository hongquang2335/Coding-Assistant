from io import BytesIO
from pathlib import Path
import zipfile

from fastapi.testclient import TestClient

from app.core import db, settings
from app.main import app
from app.services import project_service


def _configure_storage(tmp_path: Path) -> None:
    storage_dir = tmp_path / "storage"
    upload_dir = storage_dir / "uploads"
    extract_dir = storage_dir / "extracted"
    db_path = storage_dir / "app.db"

    settings.STORAGE_DIR = storage_dir
    settings.UPLOAD_DIR = upload_dir
    settings.EXTRACT_DIR = extract_dir
    settings.DB_PATH = db_path

    db.STORAGE_DIR = storage_dir
    db.UPLOAD_DIR = upload_dir
    db.EXTRACT_DIR = extract_dir
    db.DB_PATH = db_path

    project_service.UPLOAD_DIR = upload_dir
    project_service.EXTRACT_DIR = extract_dir

    db.ensure_storage()
    db.init_db()


def _build_test_zip() -> bytes:
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(
            "pkg/main.py",
            "\n".join(
                [
                    "class Greeter:",
                    "    def say_hi(self, name: str) -> str:",
                    "        print(name)",
                    "        return f'Hi {name}'",
                    "",
                    "",
                    "def add(a: int, b: int) -> int:",
                    "    # TODO: handle overflow",
                    "    return a + b",
                ]
            ),
        )
    return buffer.getvalue()


def _find_node(node: dict, target_path: str) -> dict | None:
    if node["path"] == target_path:
        return node

    for child in node.get("children", []):
        found = _find_node(child, target_path)
        if found is not None:
            return found

    return None


def test_tree_contains_python_symbols(tmp_path: Path) -> None:
    _configure_storage(tmp_path)
    client = TestClient(app)

    response = client.post(
        "/api/projects/upload",
        files={"file": ("sample.zip", _build_test_zip(), "application/zip")},
    )
    assert response.status_code == 201
    project_id = response.json()["id"]

    tree_response = client.get(f"/api/projects/{project_id}/tree")
    assert tree_response.status_code == 200

    root = tree_response.json()["root"]
    file_node = _find_node(root, "pkg/main.py")
    assert file_node is not None
    assert file_node["type"] == "file"

    class_node = _find_node(root, "pkg/main.py::Greeter")
    function_node = _find_node(root, "pkg/main.py::add")
    method_node = _find_node(root, "pkg/main.py::Greeter.say_hi")

    assert class_node is not None
    assert function_node is not None
    assert method_node is not None
    assert method_node["start_line"] == 2


def test_source_and_review_endpoints_return_context_data(tmp_path: Path) -> None:
    _configure_storage(tmp_path)
    client = TestClient(app)

    response = client.post(
        "/api/projects/upload",
        files={"file": ("sample.zip", _build_test_zip(), "application/zip")},
    )
    assert response.status_code == 201
    project_id = response.json()["id"]

    source_response = client.get(
        f"/api/projects/{project_id}/source",
        params={"path": "pkg/main.py"},
    )
    assert source_response.status_code == 200
    assert "class Greeter" in source_response.json()["content"]

    review_response = client.get(
        f"/api/projects/{project_id}/review",
        params={
            "path": "pkg/main.py",
            "target_name": "add",
            "target_type": "function",
            "start_line": 7,
            "end_line": 9,
        },
    )
    assert review_response.status_code == 200

    payload = review_response.json()
    assert payload["target_name"] == "add"
    assert payload["target_type"] == "function"
    assert payload["findings"]
    assert payload["test_cases"]
