import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.core.exceptions import NotFoundException
from app.models.project import ProjectMedia
from app.schemas.common import APIResponse
from app.schemas.project import ProjectMediaResponse
from app.services.media_service import media_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/admin/media", tags=["Admin Media Library"], dependencies=[Depends(require_permission("media.upload"))])


@router.get("", response_model=APIResponse[List[ProjectMediaResponse]])
def get_media_library(
    project_id: Optional[int] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ProjectMedia)
    if project_id:
        query = query.filter(ProjectMedia.project_id == project_id)
    items = query.order_by(ProjectMedia.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return APIResponse(
        message="Media files retrieved",
        data=[ProjectMediaResponse.model_validate(m) for m in items],
    )


@router.post("/upload", response_model=APIResponse[dict])
def upload_standalone_media(
    file: UploadFile = File(...),
    subfolder: str = Form("general"),
):
    processed = media_service.process_and_save_image(file, subfolder=subfolder)
    return APIResponse(
        message="Media uploaded successfully",
        data=processed,
    )
