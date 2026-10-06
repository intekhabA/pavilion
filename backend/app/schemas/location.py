from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class LocalityResponse(BaseModel):
    id: int
    city_id: int
    name: str
    slug: str
    pincode: Optional[str] = None
    is_popular: bool = False
    model_config = ConfigDict(from_attributes=True)


class LocalityCreate(BaseModel):
    city_id: int
    name: str = Field(..., min_length=1, max_length=150)
    slug: Optional[str] = None
    pincode: Optional[str] = None
    is_popular: bool = False


class CityResponse(BaseModel):
    id: int
    state_id: int
    name: str
    slug: str
    is_featured: bool = False
    image_url: Optional[str] = None
    is_active: bool = True
    project_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)


class CityDetailResponse(CityResponse):
    localities: List[LocalityResponse] = []


class CityCreate(BaseModel):
    state_id: int
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    is_featured: bool = False
    image_url: Optional[str] = None
    is_active: bool = True


class StateResponse(BaseModel):
    id: int
    country_id: int
    name: str
    code: Optional[str] = None
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)


class StateDetailResponse(StateResponse):
    cities: List[CityResponse] = []


class StateCreate(BaseModel):
    country_id: int
    name: str = Field(..., min_length=1, max_length=100)
    code: Optional[str] = None
    is_active: bool = True


class CountryResponse(BaseModel):
    id: int
    name: str
    code: str
    currency_code: str = "INR"
    currency_symbol: str = "₹"
    phone_code: str = "+91"
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)


class CountryDetailResponse(CountryResponse):
    states: List[StateResponse] = []


class CountryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=2, max_length=10)
    currency_code: str = "INR"
    currency_symbol: str = "₹"
    phone_code: str = "+91"
    is_active: bool = True
