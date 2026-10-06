import re
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.redis import get_cache, set_cache, delete_cache_pattern
from app.core.exceptions import NotFoundException, ConflictException
from app.models.location import Country, State, City, Locality
from app.schemas.location import CountryCreate, StateCreate, CityCreate, LocalityCreate


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


class LocationService:
    # --- Countries ---
    @staticmethod
    def get_countries(db: Session, active_only: bool = True) -> List[Country]:
        cache_key = f"locations:countries:{active_only}"
        cached = get_cache(cache_key)
        if cached:
            return [Country(**item) for item in cached]

        query = db.query(Country)
        if active_only:
            query = query.filter(Country.is_active.is_(True))
        countries = query.order_by(Country.name.asc()).all()
        return countries

    @staticmethod
    def create_country(db: Session, data: CountryCreate) -> Country:
        existing = db.query(Country).filter(
            (Country.code == data.code.upper()) | (Country.name == data.name)
        ).first()
        if existing:
            raise ConflictException("Country with this name or code already exists.")

        country = Country(
            name=data.name,
            code=data.code.upper(),
            currency_code=data.currency_code,
            currency_symbol=data.currency_symbol,
            phone_code=data.phone_code,
            is_active=data.is_active,
        )
        db.add(country)
        db.commit()
        db.refresh(country)
        delete_cache_pattern("locations:*")
        return country

    # --- States ---
    @staticmethod
    def get_states(db: Session, country_id: Optional[int] = None, active_only: bool = True) -> List[State]:
        query = db.query(State)
        if country_id:
            query = query.filter(State.country_id == country_id)
        if active_only:
            query = query.filter(State.is_active.is_(True))
        return query.order_by(State.name.asc()).all()

    @staticmethod
    def create_state(db: Session, data: StateCreate) -> State:
        country = db.query(Country).filter(Country.id == data.country_id).first()
        if not country:
            raise NotFoundException("Country not found.")

        state = State(
            country_id=data.country_id,
            name=data.name,
            code=data.code.upper() if data.code else None,
            is_active=data.is_active,
        )
        db.add(state)
        db.commit()
        db.refresh(state)
        delete_cache_pattern("locations:*")
        return state

    # --- Cities ---
    @staticmethod
    def get_cities(db: Session, state_id: Optional[int] = None, featured_only: bool = False, active_only: bool = True) -> List[City]:
        query = db.query(City)
        if state_id:
            query = query.filter(City.state_id == state_id)
        if featured_only:
            query = query.filter(City.is_featured.is_(True))
        if active_only:
            query = query.filter(City.is_active.is_(True))
        return query.order_by(City.name.asc()).all()

    @staticmethod
    def create_city(db: Session, data: CityCreate) -> City:
        state = db.query(State).filter(State.id == data.state_id).first()
        if not state:
            raise NotFoundException("State not found.")

        slug = data.slug or slugify(data.name)
        city = City(
            state_id=data.state_id,
            name=data.name,
            slug=slug,
            is_featured=data.is_featured,
            image_url=data.image_url,
            is_active=data.is_active,
        )
        db.add(city)
        db.commit()
        db.refresh(city)
        delete_cache_pattern("locations:*")
        return city

    # --- Localities ---
    @staticmethod
    def get_localities(db: Session, city_id: Optional[int] = None, popular_only: bool = False) -> List[Locality]:
        query = db.query(Locality)
        if city_id:
            query = query.filter(Locality.city_id == city_id)
        if popular_only:
            query = query.filter(Locality.is_popular.is_(True))
        return query.order_by(Locality.name.asc()).all()

    @staticmethod
    def create_locality(db: Session, data: LocalityCreate) -> Locality:
        city = db.query(City).filter(City.id == data.city_id).first()
        if not city:
            raise NotFoundException("City not found.")

        slug = data.slug or slugify(data.name)
        locality = Locality(
            city_id=data.city_id,
            name=data.name,
            slug=slug,
            pincode=data.pincode,
            is_popular=data.is_popular,
        )
        db.add(locality)
        db.commit()
        db.refresh(locality)
        delete_cache_pattern("locations:*")
        return locality


location_service = LocationService()
