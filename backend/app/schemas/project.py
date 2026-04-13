from datetime import datetime

from pydantic import BaseModel, Field


class ProjectOut(BaseModel):
    id: str
    name: str
    status: str
    created_at: datetime
    file_count: int


class ProjectListResponse(BaseModel):
    items: list[ProjectOut]


class ProjectTreeNode(BaseModel):
    name: str
    path: str
    type: str
    file_path: str | None = None
    start_line: int | None = None
    end_line: int | None = None
    children: list["ProjectTreeNode"] = Field(default_factory=list)


class ProjectTreeResponse(BaseModel):
    project_id: str
    root: ProjectTreeNode


class SourceFileResponse(BaseModel):
    project_id: str
    path: str
    content: str


class ReviewFinding(BaseModel):
    severity: str
    title: str
    explanation: str
    file_path: str
    start_line: int | None = None
    end_line: int | None = None
    suggestion: str


class ReviewSuggestion(BaseModel):
    title: str
    detail: str


class ReviewTestCase(BaseModel):
    title: str
    detail: str


class ReviewResultResponse(BaseModel):
    project_id: str
    path: str
    target_name: str
    target_type: str
    summary: str
    findings: list[ReviewFinding]
    suggestions: list[ReviewSuggestion]
    test_cases: list[ReviewTestCase]
