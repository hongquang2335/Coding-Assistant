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
    children: list["ProjectTreeNode"] = Field(default_factory=list)


class ProjectTreeResponse(BaseModel):
    project_id: str
    root: ProjectTreeNode


class SourceFileResponse(BaseModel):
    project_id: str
    path: str
    content: str
