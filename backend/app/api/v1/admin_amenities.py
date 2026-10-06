import re
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.core.exceptions import NotFoundException, ConflictException
from app.models.project import Amenity, PropertyType
from app.schemas.common import APIResponse
from app.schemas.amenity import (
    AmenityCreate,
    AmenityResponse,
    PropertyTypeCreate,
    PropertyTypeResponse,
)

router = APIRouter(prefix="/admin/amenities", tags=["Admin Amenities"], dependencies=[Depends(require_permission("settings.manage"))])


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


@router.get("", response_model=APIResponse[List[AmenityResponse]])
def get_all_amenities(db: Session = Depends(get_db)):
    items = db.query(Amenity).order_by(Amenity.category.asc(), Amenity.name.asc()).all()
    return APIResponse(data=[AmenityResponse.model_validate(a) for a in items])


@router.post("", response_model=APIResponse[AmenityResponse])
def create_amenity(data: AmenityCreate, db: Session = Depends(get_db)):
    slug = data.slug or slugify(data.name)
    existing = db.query(Amenity).filter(Amenity.slug == slug).first()
    if existing:
        raise ConflictException("Amenity already exists.")

    amenity = Amenity(
        name=data.name,
        slug=slug,
        category=data.category,
        icon=data.icon,
    )
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return APIResponse(message="Amenity created", data=AmenityResponse.model_validate(amenity))


@router.delete("/{amenity_id}", response_model=APIResponse[None])
def delete_amenity(amenity_id: int, db: Session = Depends(get_db)):
    item = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not item:
        raise NotFoundException("Amenity not found.")
    db.delete(item)
    db.commit()
    return APIResponse(message="Amenity deleted", data=None)


# Property Types
@router.get("/property-types", response_model=APIResponse[List[PropertyTypeResponse]])
def get_all_property_types(db: Session = Depends(get_db)):
    items = db.query(PropertyType).order_by(PropertyType.name.asc()).all()
    return APIResponse(data=[PropertyTypeResponse.model_validate(p) for p in items])


@router.post("/property-types", response_model=APIResponse[PropertyTypeResponse])
def create_property_type(data: PropertyTypeCreate, db: Session = Depends(get_db)):
    slug = data.slug or slugify(data.name)
    existing = db.query(PropertyType).filter(PropertyType.slug == slug).first()
    if existing:
        raise ConflictException("Property type already exists.")

    pt = PropertyType(
        name=data.name,
        slug=slug,
        icon=data.icon,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(pt)
    db.commit()
    db.refresh(pt)
    return APIResponse(message="Property type created", data=PropertyTypeResponse.model_validate(pt))


@router.delete("/property-types/{pt_id}", response_model=APIResponse[None])
def delete_property_type(pt_id: int, db: Session = Depends(get_db)):
    item = db.query(PropertyType).filter(PropertyType.id == pt_id).first()
    if not item:
        raise NotFoundException("Property type not found.")
    db.delete(item)
    db.commit()
    return APIResponse(message="Property type deleted", data=None)
