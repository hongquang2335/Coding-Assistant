from datetime import datetime

from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: str
    name: str
    status: str
    created_at: datetime
    file_count: int


class ProjectListResponse(BaseModel):
    items: list[ProjectOut]
