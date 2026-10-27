import math
import os
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import httpx
from app.core.config import settings
from app.api.dependencies import get_db, rate_limit_general
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.project import (
    ProjectCardResponse,
    ProjectDetailResponse,
    ProjectFilterParams,
)
from app.services.project_service import project_service
from app.services.storage_service import storage_service
from app.models.project import ProjectDocument

router = APIRouter(prefix="/projects", tags=["Public Projects"], dependencies=[Depends(rate_limit_general)])


def to_project_card(p) -> ProjectCardResponse:
    return ProjectCardResponse(
        id=p.id,
        uuid=p.uuid,
        name=p.name,
        slug=p.slug,
        developer_name=p.developer_name,
        project_type=p.project_type,
        status=p.status,
        construction_status=p.construction_status,
        featured=p.featured,
        city_name=p.city.name if p.city else "",
        locality_name=p.locality.name if p.locality else None,
        min_price=p.min_price,
        max_price=p.max_price,
        currency=p.currency,
        price_label=p.price_label,
        bedrooms_summary=p.bedrooms_summary,
        area_from=p.area_from,
        area_to=p.area_to,
        area_unit=p.area_unit,
        rera_number=p.rera_number,
        primary_image_url=storage_service.get_presigned_url(p.primary_image_url) if p.primary_image_url else None,
        logo_url=storage_service.get_presigned_url(p.logo_url) if p.logo_url else None,
        property_type_name=p.property_type.name if p.property_type else None,
        created_at=p.created_at,
    )


@router.get("", response_model=APIResponse[PaginatedData[ProjectCardResponse]])
def get_projects(
    q: Optional[str] = None,
    country_id: Optional[int] = None,
    state_id: Optional[int] = None,
    city_id: Optional[int] = None,
    locality_id: Optional[int] = None,
    property_type_id: Optional[int] = None,
    bhk: Optional[str] = None,
    construction_status: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    sort_by: Optional[str] = "created_at",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    filters = ProjectFilterParams(
        q=q,
        country_id=country_id,
        state_id=state_id,
        city_id=city_id,
        locality_id=locality_id,
        property_type_id=property_type_id,
        bhk=bhk,
        construction_status=construction_status,
        featured=featured,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
    )

    items, total = project_service.list_projects(
        db, filters=filters, page=page, page_size=page_size, public_only=True
    )

    cards = [to_project_card(p) for p in items]
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return APIResponse(
        message="Projects retrieved successfully",
        data=PaginatedData(
            items=cards,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.get("/featured", response_model=APIResponse[List[ProjectCardResponse]])
def get_featured_projects(limit: int = Query(default=6, ge=1, le=20), db: Session = Depends(get_db)):
    projects = project_service.get_featured_projects(db, limit=limit)
    cards = [to_project_card(p) for p in projects]
    return APIResponse(message="Featured projects retrieved", data=cards)


@router.get("/{slug}", response_model=APIResponse[ProjectDetailResponse])
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    project = project_service.get_project_by_slug(db, slug=slug, public_only=True)
    
    # Create detail response with pre-signed URLs for S3 objects
    detail_data = ProjectDetailResponse.model_validate(project)
    if detail_data.primary_image_url:
        detail_data.primary_image_url = storage_service.get_presigned_url(detail_data.primary_image_url)
    if detail_data.logo_url:
        detail_data.logo_url = storage_service.get_presigned_url(detail_data.logo_url)
    # Also handle media URLs
    for media in detail_data.media:
        if media.file_url:
            media.file_url = storage_service.get_presigned_url(media.file_url)
        if media.thumbnail_url:
            media.thumbnail_url = storage_service.get_presigned_url(media.thumbnail_url)
        if media.webp_url:
            media.webp_url = storage_service.get_presigned_url(media.webp_url)
    # Handle documents
    for doc in detail_data.documents:
        if doc.file_url:
            doc.file_url = storage_service.get_presigned_url(doc.file_url)
    
    return APIResponse(
        message="Project details retrieved",
        data=detail_data,
    )


@router.get("/{slug}/similar", response_model=APIResponse[List[ProjectCardResponse]])
def get_similar_projects(slug: str, limit: int = Query(default=4, ge=1, le=10), db: Session = Depends(get_db)):
    project = project_service.get_project_by_slug(db, slug=slug, public_only=True)
    similar = project_service.get_similar_projects(db, project=project, limit=limit)
    cards = [to_project_card(p) for p in similar]
    return APIResponse(message="Similar projects retrieved", data=cards)


@router.get("/documents/{doc_id}/download")
def download_project_document(doc_id: int, db: Session = Depends(get_db)):
    """Proxy a project document download so the browser can save it same-origin.

    The frontend fetches this endpoint (localhost) instead of an external URL,
    avoiding CORS "Network Error" when the document is hosted on a third party.
    The file is retrieved server-side and streamed back with an attachment
    disposition so the browser triggers a save-as download.
    """
    doc = db.query(ProjectDocument).filter(ProjectDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    file_url = doc.file_url
    file_name = doc.file_name or "document.pdf"

    # Generate pre-signed URL for S3 objects to ensure access
    from app.services.storage_service import storage_service
    presigned_url = storage_service.get_presigned_url(file_url)
    
    # Use the pre-signed URL if available, otherwise fall back to original URL
    fetch_url = presigned_url if presigned_url else file_url

    def iter_file():
        import logging
        import tempfile
        import sys
        logger = logging.getLogger("pavilion.document_download")
        print(f"DEBUG: Starting iter_file for doc_id={doc_id}, fetch_url={fetch_url[:100]}...", file=sys.stderr, flush=True)
        logger.info(f"Starting iter_file for doc_id={doc_id}, fetch_url={fetch_url[:100]}...")
        try:
            if fetch_url.startswith(settings.MEDIA_URL_PREFIX):
                # Serve local file directly from disk
                relative_path = fetch_url[len(settings.MEDIA_URL_PREFIX):].lstrip("/")
                full_path = os.path.join(settings.MEDIA_DIR, relative_path)
                if not os.path.exists(full_path):
                    raise HTTPException(status_code=404, detail="Document file not found on server.")
                print(f"DEBUG: Reading local file: {full_path}", file=sys.stderr, flush=True)
                logger.info(f"Reading local file: {full_path}")
                with open(full_path, "rb") as f:
                    while True:
                        chunk = f.read(1024 * 1024)
                        if not chunk:
                            break
                        yield chunk
            else:
                # Fetch external URL server-side (no CORS restriction server-to-server)
                print(f"DEBUG: Fetching from external URL: {fetch_url[:100]}...", file=sys.stderr, flush=True)
                logger.info(f"Fetching from external URL: {fetch_url[:100]}...")
                # Download to temp file first for more reliable streaming
                with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                    temp_path = tmp_file.name
                    with httpx.stream("GET", fetch_url, follow_redirects=True, timeout=60) as resp:
                        print(f"DEBUG: Response status: {resp.status_code}", file=sys.stderr, flush=True)
                        logger.info(f"Response status: {resp.status_code}")
                        resp.raise_for_status()
                        for chunk in resp.iter_bytes():
                            tmp_file.write(chunk)
                
                # Now stream from temp file
                print(f"DEBUG: Streaming from temp file: {temp_path}", file=sys.stderr, flush=True)
                logger.info(f"Streaming from temp file: {temp_path}")
                with open(temp_path, "rb") as f:
                    while True:
                        chunk = f.read(1024 * 1024)
                        if not chunk:
                            break
                        yield chunk
                
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass
        except HTTPException:
            raise
        except Exception as exc:
            print(f"DEBUG: Error in iter_file: {exc}", file=sys.stderr, flush=True)
            logger.error(f"Error in iter_file: {exc}", exc_info=True)
            raise HTTPException(status_code=502, detail=f"Failed to fetch document: {exc}")

    media_type = doc.mime_type or "application/octet-stream"
    return StreamingResponse(
        iter_file(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
