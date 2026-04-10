from fastapi import APIRouter, File, UploadFile, status

from app.schemas.project import ProjectListResponse, ProjectOut
from app.services.project_service import create_project_from_upload, list_projects

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("/upload", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def upload_project(file: UploadFile = File(...)) -> ProjectOut:
    record = await create_project_from_upload(file)
    return ProjectOut(**record)


@router.get("", response_model=ProjectListResponse)
def get_projects() -> ProjectListResponse:
    items = [ProjectOut(**row) for row in list_projects()]
    return ProjectListResponse(items=items)
