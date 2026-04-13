import re

from app.services.source_service import read_project_source


def _find_pattern_lines(content: str, pattern: str) -> list[int]:
    matches: list[int] = []
    for index, line in enumerate(content.splitlines(), start=1):
        if re.search(pattern, line):
            matches.append(index)
    return matches


def build_review_result(
    project_id: str,
    path: str,
    target_name: str | None = None,
    target_type: str | None = None,
    start_line: int | None = None,
    end_line: int | None = None,
) -> dict:
    source_payload = read_project_source(project_id, path)
    lines = source_payload["content"].splitlines()

    effective_start = max(start_line or 1, 1)
    effective_end = min(end_line or len(lines), len(lines))
    snippet_lines = lines[effective_start - 1 : effective_end]
    snippet = "\n".join(snippet_lines)

    resolved_name = target_name or path
    resolved_type = target_type or "file"

    findings: list[dict] = []

    todo_lines = _find_pattern_lines(snippet, r"\b(TODO|FIXME)\b")
    if todo_lines:
        first_line = effective_start + todo_lines[0] - 1
        findings.append(
            {
                "severity": "medium",
                "title": "Pending implementation marker",
                "explanation": "The selected code contains TODO/FIXME markers, which usually means the behavior is incomplete or deferred.",
                "file_path": path,
                "start_line": first_line,
                "end_line": first_line,
                "suggestion": "Either complete the pending work or convert the note into a tracked issue with explicit acceptance criteria.",
            }
        )

    bare_except_lines = _find_pattern_lines(snippet, r"^\s*except\s*:\s*$")
    if bare_except_lines:
        first_line = effective_start + bare_except_lines[0] - 1
        findings.append(
            {
                "severity": "high",
                "title": "Bare except hides root cause",
                "explanation": "A bare except catches system-exiting exceptions and makes debugging harder.",
                "file_path": path,
                "start_line": first_line,
                "end_line": first_line,
                "suggestion": "Catch the specific exception types you expect and preserve enough context for logging or error reporting.",
            }
        )

    print_lines = _find_pattern_lines(snippet, r"\bprint\s*\(")
    if print_lines:
        first_line = effective_start + print_lines[0] - 1
        findings.append(
            {
                "severity": "low",
                "title": "Console output in application code",
                "explanation": "Direct print statements are fragile for debugging and are usually better replaced with structured logging.",
                "file_path": path,
                "start_line": first_line,
                "end_line": first_line,
                "suggestion": "Replace ad-hoc prints with a logger or remove them if they are no longer needed.",
            }
        )

    pass_lines = _find_pattern_lines(snippet, r"^\s*pass\s*$")
    if pass_lines:
        first_line = effective_start + pass_lines[0] - 1
        findings.append(
            {
                "severity": "medium",
                "title": "Empty implementation block",
                "explanation": "The selected scope contains a pass statement, which often means there is no meaningful behavior yet.",
                "file_path": path,
                "start_line": first_line,
                "end_line": first_line,
                "suggestion": "Either implement the branch or raise an explicit exception so incomplete behavior is visible during testing.",
            }
        )

    suggestions = [
        {
            "title": "Keep the scope narrow",
            "detail": f"Review and modify only the selected {resolved_type} `{resolved_name}` unless the dependency chain proves a wider change is necessary.",
        },
        {
            "title": "Anchor future AI output to evidence",
            "detail": "Any later model-backed review should cite file path and line ranges from this selected context before making claims.",
        },
    ]

    test_cases = [
        {
            "title": "Nominal path",
            "detail": f"Add a test that exercises the expected success behavior of `{resolved_name}` with representative input.",
        },
        {
            "title": "Boundary case",
            "detail": f"Add a test for empty, missing, or minimal input reaching `{resolved_name}`.",
        },
        {
            "title": "Failure handling",
            "detail": f"Add a test that proves `{resolved_name}` fails predictably when dependencies or input are invalid.",
        },
    ]

    line_count = max(effective_end - effective_start + 1, 0)
    summary = (
        f"Review context: {resolved_type} `{resolved_name}` in `{path}` covering {line_count} line(s). "
        f"{'Detected heuristic findings that need manual confirmation.' if findings else 'No obvious heuristic issues were detected in the selected snippet.'}"
    )

    return {
        "project_id": project_id,
        "path": path,
        "target_name": resolved_name,
        "target_type": resolved_type,
        "summary": summary,
        "findings": findings,
        "suggestions": suggestions,
        "test_cases": test_cases,
    }
