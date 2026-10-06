from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.core.exceptions import NotFoundException
from app.models.location import Country, State, City, Locality
from app.schemas.common import APIResponse
from app.schemas.location import (
    CountryCreate,
    CountryResponse,
    StateCreate,
    StateResponse,
    CityCreate,
    CityResponse,
    LocalityCreate,
    LocalityResponse,
)
from app.services.location_service import location_service

router = APIRouter(prefix="/admin/locations", tags=["Admin Locations"], dependencies=[Depends(require_permission("settings.manage"))])


# Countries
@router.get("/countries", response_model=APIResponse[List[CountryResponse]])
def get_all_countries(db: Session = Depends(get_db)):
    countries = db.query(Country).order_by(Country.name.asc()).all()
    return APIResponse(data=[CountryResponse.model_validate(c) for c in countries])


@router.post("/countries", response_model=APIResponse[CountryResponse])
def create_country(data: CountryCreate, db: Session = Depends(get_db)):
    country = location_service.create_country(db, data)
    return APIResponse(message="Country created", data=CountryResponse.model_validate(country))


@router.delete("/countries/{country_id}", response_model=APIResponse[None])
def delete_country(country_id: int, db: Session = Depends(get_db)):
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise NotFoundException("Country not found.")
    db.delete(country)
    db.commit()
    return APIResponse(message="Country deleted", data=None)


# States
@router.get("/states", response_model=APIResponse[List[StateResponse]])
def get_all_states(country_id: Optional[int] = None, db: Session = Depends(get_db)):
    states = location_service.get_states(db, country_id=country_id, active_only=False)
    return APIResponse(data=[StateResponse.model_validate(s) for s in states])


@router.post("/states", response_model=APIResponse[StateResponse])
def create_state(data: StateCreate, db: Session = Depends(get_db)):
    state = location_service.create_state(db, data)
    return APIResponse(message="State created", data=StateResponse.model_validate(state))


@router.delete("/states/{state_id}", response_model=APIResponse[None])
def delete_state(state_id: int, db: Session = Depends(get_db)):
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise NotFoundException("State not found.")
    db.delete(state)
    db.commit()
    return APIResponse(message="State deleted", data=None)


# Cities
@router.get("/cities", response_model=APIResponse[List[CityResponse]])
def get_all_cities(state_id: Optional[int] = None, db: Session = Depends(get_db)):
    cities = location_service.get_cities(db, state_id=state_id, active_only=False)
    return APIResponse(data=[CityResponse.model_validate(c) for c in cities])


@router.post("/cities", response_model=APIResponse[CityResponse])
def create_city(data: CityCreate, db: Session = Depends(get_db)):
    city = location_service.create_city(db, data)
    return APIResponse(message="City created", data=CityResponse.model_validate(city))


@router.delete("/cities/{city_id}", response_model=APIResponse[None])
def delete_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise NotFoundException("City not found.")
    db.delete(city)
    db.commit()
    return APIResponse(message="City deleted", data=None)


# Localities
@router.get("/localities", response_model=APIResponse[List[LocalityResponse]])
def get_all_localities(city_id: Optional[int] = None, db: Session = Depends(get_db)):
    localities = location_service.get_localities(db, city_id=city_id)
    return APIResponse(data=[LocalityResponse.model_validate(loc) for loc in localities])


@router.post("/localities", response_model=APIResponse[LocalityResponse])
def create_locality(data: LocalityCreate, db: Session = Depends(get_db)):
    locality = location_service.create_locality(db, data)
    return APIResponse(message="Locality created", data=LocalityResponse.model_validate(locality))


@router.delete("/localities/{locality_id}", response_model=APIResponse[None])
def delete_locality(locality_id: int, db: Session = Depends(get_db)):
    locality = db.query(Locality).filter(Locality.id == locality_id).first()
    if not locality:
        raise NotFoundException("Locality not found.")
    db.delete(locality)
    db.commit()
    return APIResponse(message="Locality deleted", data=None)
