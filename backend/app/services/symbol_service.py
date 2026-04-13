import ast
from pathlib import Path


def _qualify_name(parent_name: str | None, child_name: str) -> str:
    if not parent_name:
        return child_name
    return f"{parent_name}.{child_name}"


def _build_symbol_nodes(
    body: list[ast.stmt],
    relative_path: str,
    parent_name: str | None = None,
) -> list[dict]:
    nodes: list[dict] = []

    for item in body:
        if isinstance(item, ast.ClassDef):
            qualified_name = _qualify_name(parent_name, item.name)
            nodes.append(
                {
                    "name": item.name,
                    "path": f"{relative_path}::{qualified_name}",
                    "type": "class",
                    "file_path": relative_path,
                    "start_line": item.lineno,
                    "end_line": getattr(item, "end_lineno", item.lineno),
                    "children": _build_symbol_nodes(item.body, relative_path, qualified_name),
                }
            )
            continue

        if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
            qualified_name = _qualify_name(parent_name, item.name)
            nodes.append(
                {
                    "name": item.name,
                    "path": f"{relative_path}::{qualified_name}",
                    "type": "function",
                    "file_path": relative_path,
                    "start_line": item.lineno,
                    "end_line": getattr(item, "end_lineno", item.lineno),
                    "children": [],
                }
            )

    return nodes


def parse_python_symbols(source_path: Path, relative_path: str) -> list[dict]:
    try:
        source = source_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        source = source_path.read_text(encoding="utf-8", errors="replace")

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []

    return _build_symbol_nodes(tree.body, relative_path)
