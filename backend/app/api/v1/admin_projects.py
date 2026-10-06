import math
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user, require_permission
from app.core.exceptions import NotFoundException, ValidationException
from app.middleware.rate_limiter import get_client_ip
from app.models.user import User
from app.models.project import Project, ProjectMedia, ProjectVideo, ProjectDocument, ProjectConfiguration
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectDetailResponse,
    ProjectCardResponse,
    ProjectFilterParams,
    ProjectMediaResponse,
    ProjectMediaUpdate,
    ProjectVideoCreate,
    ProjectVideoResponse,
    ProjectDocumentResponse,
    ProjectConfigurationCreate,
    ProjectConfigurationResponse,
)
from app.services.project_service import project_service
from app.services.media_service import media_service
from app.services.audit_service import audit_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/admin/projects", tags=["Admin Projects"])


@router.get("", response_model=APIResponse[PaginatedData[ProjectCardResponse]])
def list_admin_projects(
    q: Optional[str] = None,
    status: Optional[str] = None,
    city_id: Optional[int] = None,
    property_type_id: Optional[int] = None,
    featured: Optional[bool] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(require_permission("projects.view")),
    db: Session = Depends(get_db),
):
    filters = ProjectFilterParams(
        q=q,
        status=status,
        city_id=city_id,
        property_type_id=property_type_id,
        featured=featured,
    )
    items, total = project_service.list_projects(
        db, filters=filters, page=page, page_size=page_size, public_only=False
    )

    from app.api.v1.public_projects import to_project_card
    cards = [to_project_card(p) for p in items]
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return APIResponse(
        message="Admin projects retrieved",
        data=PaginatedData(
            items=cards,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.get("/{project_id}", response_model=APIResponse[ProjectDetailResponse])
def get_project_by_id(
    project_id: int,
    current_user: User = Depends(require_permission("projects.view")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id=project_id)
    return APIResponse(
        message="Project retrieved",
        data=ProjectDetailResponse.model_validate(project),
    )


@router.post("", response_model=APIResponse[ProjectDetailResponse])
def create_project(
    data: ProjectCreate,
    request: Request,
    current_user: User = Depends(require_permission("projects.create")),
    db: Session = Depends(get_db),
):
    project = project_service.create_project(db, data, user_id=current_user.id)
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_CREATE", entity="project", entity_id=str(project.id),
        user_id=current_user.id, ip_address=ip, details={"name": project.name, "slug": project.slug}
    )
    return APIResponse(
        message="Project created successfully",
        data=ProjectDetailResponse.model_validate(project),
    )


@router.put("/{project_id}", response_model=APIResponse[ProjectDetailResponse])
def update_project(
    project_id: int,
    data: ProjectUpdate,
    request: Request,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    project = project_service.update_project(db, project_id=project_id, data=data)
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_UPDATE", entity="project", entity_id=str(project.id),
        user_id=current_user.id, ip_address=ip, details={"name": project.name}
    )
    return APIResponse(
        message="Project updated successfully",
        data=ProjectDetailResponse.model_validate(project),
    )


@router.delete("/{project_id}", response_model=APIResponse[None])
def delete_project(
    project_id: int,
    request: Request,
    current_user: User = Depends(require_permission("projects.delete")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id)
    name = project.name
    project_service.delete_project(db, project_id=project_id)
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_DELETE", entity="project", entity_id=str(project_id),
        user_id=current_user.id, ip_address=ip, details={"name": name}
    )
    return APIResponse(message="Project deleted successfully", data=None)


@router.post("/{project_id}/publish", response_model=APIResponse[None])
def publish_project(
    project_id: int,
    request: Request,
    current_user: User = Depends(require_permission("projects.publish")),
    db: Session = Depends(get_db),
):
    project = project_service.set_publish_status(db, project_id=project_id, status="published")
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_PUBLISH", entity="project", entity_id=str(project.id),
        user_id=current_user.id, ip_address=ip, details={"status": "published"}
    )
    return APIResponse(message="Project published successfully", data=None)


@router.post("/{project_id}/unpublish", response_model=APIResponse[None])
def unpublish_project(
    project_id: int,
    request: Request,
    current_user: User = Depends(require_permission("projects.publish")),
    db: Session = Depends(get_db),
):
    project = project_service.set_publish_status(db, project_id=project_id, status="draft")
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_UNPUBLISH", entity="project", entity_id=str(project.id),
        user_id=current_user.id, ip_address=ip, details={"status": "draft"}
    )
    return APIResponse(message="Project unpublished (set to draft)", data=None)


@router.post("/{project_id}/duplicate", response_model=APIResponse[ProjectDetailResponse])
def duplicate_project(
    project_id: int,
    request: Request,
    current_user: User = Depends(require_permission("projects.create")),
    db: Session = Depends(get_db),
):
    copy_project = project_service.duplicate_project(db, project_id=project_id, user_id=current_user.id)
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="PROJECT_DUPLICATE", entity="project", entity_id=str(copy_project.id),
        user_id=current_user.id, ip_address=ip, details={"original_id": project_id, "copy_id": copy_project.id}
    )
    return APIResponse(
        message="Project duplicated successfully",
        data=ProjectDetailResponse.model_validate(copy_project),
    )


# --- Media Management ---
@router.post("/{project_id}/media", response_model=APIResponse[ProjectMediaResponse])
def upload_project_media(
    project_id: int,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    is_primary: bool = Form(False),
    current_user: User = Depends(require_permission("media.upload")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id)
    processed = media_service.process_and_save_image(file, subfolder=f"projects/{project_id}")

    if is_primary:
        # Reset any other primary media for this project
        db.query(ProjectMedia).filter(ProjectMedia.project_id == project_id).update({"is_primary": False})
        project.primary_image_url = processed["file_url"]

    media_obj = ProjectMedia(
        project_id=project_id,
        file_url=processed["file_url"],
        thumbnail_url=processed["thumbnail_url"],
        webp_url=processed["webp_url"],
        file_name=processed["file_name"],
        file_size=processed["file_size"],
        mime_type=processed["mime_type"],
        width=processed["width"],
        height=processed["height"],
        alt_text=alt_text or project.name,
        caption=caption,
        is_primary=is_primary,
    )
    db.add(media_obj)
    db.commit()
    db.refresh(media_obj)

    # Set as primary if no primary exists
    if not project.primary_image_url:
        project.primary_image_url = processed["file_url"]
        media_obj.is_primary = True
        db.commit()

    return APIResponse(
        message="Image uploaded successfully",
        data=ProjectMediaResponse.model_validate(media_obj),
    )


@router.delete("/media/{media_id}", response_model=APIResponse[None])
def delete_project_media(
    media_id: int,
    current_user: User = Depends(require_permission("media.delete")),
    db: Session = Depends(get_db),
):
    media_obj = db.query(ProjectMedia).filter(ProjectMedia.id == media_id).first()
    if not media_obj:
        raise NotFoundException("Media item not found.")

    storage_service.delete_file(media_obj.file_url)
    if media_obj.thumbnail_url:
        storage_service.delete_file(media_obj.thumbnail_url)
    if media_obj.webp_url:
        storage_service.delete_file(media_obj.webp_url)

    db.delete(media_obj)
    db.commit()
    return APIResponse(message="Media deleted successfully", data=None)


@router.put("/media/{media_id}", response_model=APIResponse[ProjectMediaResponse])
def update_project_media(
    media_id: int,
    data: ProjectMediaUpdate,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    media_obj = db.query(ProjectMedia).filter(ProjectMedia.id == media_id).first()
    if not media_obj:
        raise NotFoundException("Media item not found.")

    if data.is_primary:
        db.query(ProjectMedia).filter(ProjectMedia.project_id == media_obj.project_id).update({"is_primary": False})
        media_obj.is_primary = True
        project = db.query(Project).filter(Project.id == media_obj.project_id).first()
        if project:
            project.primary_image_url = media_obj.file_url

    if data.alt_text is not None:
        media_obj.alt_text = data.alt_text
    if data.caption is not None:
        media_obj.caption = data.caption
    if data.display_order is not None:
        media_obj.display_order = data.display_order

    db.commit()
    db.refresh(media_obj)
    return APIResponse(
        message="Media updated successfully",
        data=ProjectMediaResponse.model_validate(media_obj),
    )


# --- Video Management ---
@router.post("/{project_id}/videos", response_model=APIResponse[ProjectVideoResponse])
def add_project_video(
    project_id: int,
    data: ProjectVideoCreate,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id)
    yt_id = None
    if data.video_type == "youtube":
        yt_id = media_service.extract_youtube_id(data.video_url)
        if not yt_id:
            raise ValidationException("Invalid YouTube URL. Please provide a valid YouTube watch, share, or embed URL.")
        thumbnail_url = f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg"
    else:
        thumbnail_url = data.thumbnail_url

    video_obj = ProjectVideo(
        project_id=project_id,
        video_type=data.video_type,
        video_url=data.video_url,
        youtube_video_id=yt_id,
        title=data.title,
        thumbnail_url=thumbnail_url,
    )
    db.add(video_obj)
    db.commit()
    db.refresh(video_obj)

    return APIResponse(
        message="Video added successfully",
        data=ProjectVideoResponse.model_validate(video_obj),
    )


@router.delete("/videos/{video_id}", response_model=APIResponse[None])
def delete_project_video(
    video_id: int,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    vid = db.query(ProjectVideo).filter(ProjectVideo.id == video_id).first()
    if not vid:
        raise NotFoundException("Video not found.")
    db.delete(vid)
    db.commit()
    return APIResponse(message="Video deleted successfully", data=None)


# --- Documents Management ---
@router.post("/{project_id}/documents", response_model=APIResponse[ProjectDocumentResponse])
def upload_project_document(
    project_id: int,
    file: UploadFile = File(...),
    title: str = Form(...),
    doc_type: str = Form("brochure"),
    current_user: User = Depends(require_permission("media.upload")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id)
    processed = media_service.process_and_save_document(file, subfolder=f"projects/{project_id}/docs")

    doc_obj = ProjectDocument(
        project_id=project_id,
        title=title,
        doc_type=doc_type,
        file_url=processed["file_url"],
        file_name=processed["file_name"],
        file_size=processed["file_size"],
        mime_type=processed["mime_type"],
    )
    db.add(doc_obj)
    db.commit()
    db.refresh(doc_obj)

    return APIResponse(
        message="Document uploaded successfully",
        data=ProjectDocumentResponse.model_validate(doc_obj),
    )


@router.delete("/documents/{doc_id}", response_model=APIResponse[None])
def delete_project_document(
    doc_id: int,
    current_user: User = Depends(require_permission("media.delete")),
    db: Session = Depends(get_db),
):
    doc = db.query(ProjectDocument).filter(ProjectDocument.id == doc_id).first()
    if not doc:
        raise NotFoundException("Document not found.")
    storage_service.delete_file(doc.file_url)
    db.delete(doc)
    db.commit()
    return APIResponse(message="Document deleted successfully", data=None)


# --- Configuration Management ---
@router.post("/{project_id}/configurations", response_model=APIResponse[ProjectConfigurationResponse])
def add_project_configuration(
    project_id: int,
    data: ProjectConfigurationCreate,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    project = project_service.get_project_by_id(db, project_id)
    cfg = ProjectConfiguration(
        project_id=project_id,
        **data.model_dump(),
    )
    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return APIResponse(
        message="Configuration added successfully",
        data=ProjectConfigurationResponse.model_validate(cfg),
    )


@router.delete("/configurations/{config_id}", response_model=APIResponse[None])
def delete_project_configuration(
    config_id: int,
    current_user: User = Depends(require_permission("projects.update")),
    db: Session = Depends(get_db),
):
    cfg = db.query(ProjectConfiguration).filter(ProjectConfiguration.id == config_id).first()
    if not cfg:
        raise NotFoundException("Configuration not found.")
    db.delete(cfg)
    db.commit()
    return APIResponse(message="Configuration deleted successfully", data=None)
