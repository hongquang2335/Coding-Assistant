from fastapi import APIRouter, File, Query, UploadFile, status

from app.schemas.project import (
    ProjectListResponse,
    ProjectOut,
    ProjectTreeResponse,
    ReviewResultResponse,
    SourceFileResponse,
)
from app.services.project_service import create_project_from_upload, list_projects
from app.services.review_service import build_review_result
from app.services.source_service import build_project_tree, read_project_source

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("/upload", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def upload_project(file: UploadFile = File(...)) -> ProjectOut:
    record = await create_project_from_upload(file)
    return ProjectOut(**record)


@router.get("", response_model=ProjectListResponse)
def get_projects() -> ProjectListResponse:
    items = [ProjectOut(**row) for row in list_projects()]
    return ProjectListResponse(items=items)


@router.get("/{project_id}/tree", response_model=ProjectTreeResponse)
def get_project_tree(project_id: str) -> ProjectTreeResponse:
    return ProjectTreeResponse(**build_project_tree(project_id))


@router.get("/{project_id}/source", response_model=SourceFileResponse)
def get_project_source(
    project_id: str,
    path: str = Query(..., min_length=1),
) -> SourceFileResponse:
    return SourceFileResponse(**read_project_source(project_id, path))


@router.get("/{project_id}/review", response_model=ReviewResultResponse)
def get_project_review(
    project_id: str,
    path: str = Query(..., min_length=1),
    target_name: str | None = Query(default=None),
    target_type: str | None = Query(default=None),
    start_line: int | None = Query(default=None, ge=1),
    end_line: int | None = Query(default=None, ge=1),
) -> ReviewResultResponse:
    return ReviewResultResponse(
        **build_review_result(
            project_id=project_id,
            path=path,
            target_name=target_name,
            target_type=target_type,
            start_line=start_line,
            end_line=end_line,
        )
    )
