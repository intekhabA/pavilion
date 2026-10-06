from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, rate_limit_general
from app.schemas.common import APIResponse
from app.schemas.location import CountryResponse, StateResponse, CityResponse, LocalityResponse
from app.schemas.amenity import AmenityResponse, PropertyTypeResponse
from app.services.location_service import location_service
from app.models.project import Amenity, PropertyType

router = APIRouter(prefix="/locations", tags=["Public Locations"], dependencies=[Depends(rate_limit_general)])


@router.get("/countries", response_model=APIResponse[List[CountryResponse]])
def get_countries(db: Session = Depends(get_db)):
    countries = location_service.get_countries(db, active_only=True)
    return APIResponse(
        message="Countries retrieved",
        data=[CountryResponse.model_validate(c) for c in countries],
    )


@router.get("/states", response_model=APIResponse[List[StateResponse]])
def get_states(country_id: Optional[int] = None, db: Session = Depends(get_db)):
    states = location_service.get_states(db, country_id=country_id, active_only=True)
    return APIResponse(
        message="States retrieved",
        data=[StateResponse.model_validate(s) for s in states],
    )


@router.get("/cities", response_model=APIResponse[List[CityResponse]])
def get_cities(
    state_id: Optional[int] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db),
):
    cities = location_service.get_cities(db, state_id=state_id, featured_only=featured_only, active_only=True)
    res = []
    for c in cities:
        item = CityResponse.model_validate(c)
        item.project_count = len([p for p in c.projects if p.status == "published"])
        res.append(item)
    return APIResponse(message="Cities retrieved", data=res)


@router.get("/localities", response_model=APIResponse[List[LocalityResponse]])
def get_localities(
    city_id: Optional[int] = None,
    popular_only: bool = False,
    db: Session = Depends(get_db),
):
    localities = location_service.get_localities(db, city_id=city_id, popular_only=popular_only)
    return APIResponse(
        message="Localities retrieved",
        data=[LocalityResponse.model_validate(loc) for loc in localities],
    )


@router.get("/amenities", response_model=APIResponse[List[AmenityResponse]])
def get_amenities(db: Session = Depends(get_db)):
    amenities = db.query(Amenity).order_by(Amenity.category.asc(), Amenity.name.asc()).all()
    return APIResponse(
        message="Amenities retrieved",
        data=[AmenityResponse.model_validate(a) for a in amenities],
    )


@router.get("/property-types", response_model=APIResponse[List[PropertyTypeResponse]])
def get_property_types(db: Session = Depends(get_db)):
    ptypes = db.query(PropertyType).filter(PropertyType.is_active.is_(True)).order_by(PropertyType.name.asc()).all()
    return APIResponse(
        message="Property types retrieved",
        data=[PropertyTypeResponse.model_validate(pt) for pt in ptypes],
    )
