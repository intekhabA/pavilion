import math
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, rate_limit_general
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.project import (
    ProjectCardResponse,
    ProjectDetailResponse,
    ProjectFilterParams,
)
from app.services.project_service import project_service

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
        primary_image_url=p.primary_image_url,
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
    return APIResponse(
        message="Project details retrieved",
        data=ProjectDetailResponse.model_validate(project),
    )


@router.get("/{slug}/similar", response_model=APIResponse[List[ProjectCardResponse]])
def get_similar_projects(slug: str, limit: int = Query(default=4, ge=1, le=10), db: Session = Depends(get_db)):
    project = project_service.get_project_by_slug(db, slug=slug, public_only=True)
    similar = project_service.get_similar_projects(db, project=project, limit=limit)
    cards = [to_project_card(p) for p in similar]
    return APIResponse(message="Similar projects retrieved", data=cards)
