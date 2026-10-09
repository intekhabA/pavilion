from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.location import CountryResponse, StateResponse, CityResponse, LocalityResponse
from app.schemas.amenity import AmenityResponse, PropertyTypeResponse


class ProjectConfigurationBase(BaseModel):
    name: str
    bhk_type: str
    super_area: Optional[Decimal] = None
    carpet_area: Optional[Decimal] = None
    area_unit: str = "sq.ft"
    price: Optional[Decimal] = None
    price_label: Optional[str] = None
    bedrooms: int = 1
    bathrooms: int = 1
    balconies: int = 1
    floor_plan_image_url: Optional[str] = None
    availability_status: str = "Available"
    description: Optional[str] = None

    @field_validator(
        "super_area",
        "carpet_area",
        "price",
        "floor_plan_image_url",
        "description",
        "price_label",
        mode="before",
    )
    @classmethod
    def config_empty_str_to_none(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v


class ProjectConfigurationCreate(ProjectConfigurationBase):
    pass


class ProjectConfigurationResponse(ProjectConfigurationBase):
    id: int
    project_id: int
    model_config = ConfigDict(from_attributes=True)


class ProjectMediaBase(BaseModel):
    file_url: str
    thumbnail_url: Optional[str] = None
    webp_url: Optional[str] = None
    file_name: str
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False


class ProjectMediaCreate(ProjectMediaBase):
    pass


class ProjectMediaUpdate(BaseModel):
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    display_order: Optional[int] = None
    is_primary: Optional[bool] = None


class ProjectMediaResponse(ProjectMediaBase):
    id: int
    project_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProjectVideoBase(BaseModel):
    video_type: str = "youtube"  # youtube or custom
    video_url: str
    youtube_video_id: Optional[str] = None
    title: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ProjectVideoCreate(ProjectVideoBase):
    pass


class ProjectVideoResponse(ProjectVideoBase):
    id: int
    project_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProjectDocumentBase(BaseModel):
    title: str
    doc_type: str = "brochure"
    file_url: str
    file_name: str
    file_size: int
    mime_type: str


class ProjectDocumentCreate(ProjectDocumentBase):
    pass


class ProjectDocumentResponse(ProjectDocumentBase):
    id: int
    project_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Basic / Full Project Schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    developer_name: str = Field(..., min_length=2, max_length=200)
    project_type: str = "Residential"
    property_type_id: Optional[int] = None
    status: str = "draft"  # draft, published, archived
    construction_status: str = "Under Construction"
    featured: bool = False
    display_order: int = 0

    # Location
    country_id: int
    state_id: int
    city_id: int
    locality_id: Optional[int] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    google_maps_url: Optional[str] = None

    # Pricing & Specs
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    currency: str = "INR"
    price_label: Optional[str] = None
    area_from: Optional[Decimal] = None
    area_to: Optional[Decimal] = None
    area_unit: str = "sq.ft"
    bedrooms_summary: Optional[str] = None
    bathrooms_summary: Optional[str] = None
    parking: Optional[str] = None
    total_floors: Optional[int] = None
    total_units: Optional[int] = None
    total_towers: Optional[int] = None
    total_area_acres: Optional[Decimal] = None
    possession_date: Optional[date] = None
    launch_date: Optional[date] = None
    rera_number: Optional[str] = None
    primary_image_url: Optional[str] = None

    # SEO
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image: Optional[str] = None
    is_indexable: bool = True

    @field_validator(
        "possession_date",
        "launch_date",
        "latitude",
        "longitude",
        "total_area_acres",
        "min_price",
        "max_price",
        "area_from",
        "area_to",
        "total_floors",
        "total_units",
        "total_towers",
        "locality_id",
        "property_type_id",
        "slug",
        mode="before",
    )
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("country_id", "state_id", "city_id", mode="before")
    @classmethod
    def sanitize_location_ids(cls, v):
        if v == "" or v is None or (isinstance(v, str) and not v.strip()):
            return 1
        try:
            val = int(v)
            return val if val > 0 else 1
        except (ValueError, TypeError):
            return 1


class ProjectCreate(ProjectBase):
    amenity_ids: Optional[List[int]] = []
    configurations: Optional[List[ProjectConfigurationCreate]] = []
    videos: Optional[List[ProjectVideoCreate]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    developer_name: Optional[str] = None
    project_type: Optional[str] = None
    property_type_id: Optional[int] = None
    status: Optional[str] = None
    construction_status: Optional[str] = None
    featured: Optional[bool] = None
    display_order: Optional[int] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    locality_id: Optional[int] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    google_maps_url: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    currency: Optional[str] = None
    price_label: Optional[str] = None
    area_from: Optional[Decimal] = None
    area_to: Optional[Decimal] = None
    area_unit: Optional[str] = None
    bedrooms_summary: Optional[str] = None
    bathrooms_summary: Optional[str] = None
    parking: Optional[str] = None
    total_floors: Optional[int] = None
    total_units: Optional[int] = None
    total_towers: Optional[int] = None
    total_area_acres: Optional[Decimal] = None
    possession_date: Optional[date] = None
    launch_date: Optional[date] = None
    rera_number: Optional[str] = None
    primary_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image: Optional[str] = None
    is_indexable: Optional[bool] = None
    amenity_ids: Optional[List[int]] = None

    @field_validator(
        "possession_date",
        "launch_date",
        "latitude",
        "longitude",
        "total_area_acres",
        "min_price",
        "max_price",
        "area_from",
        "area_to",
        "total_floors",
        "total_units",
        "total_towers",
        "locality_id",
        "property_type_id",
        "slug",
        mode="before",
    )
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v


# Optimized card representation for listings and search
class ProjectCardResponse(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    developer_name: str
    project_type: str
    status: str
    construction_status: str
    featured: bool
    city_name: str
    locality_name: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    currency: str
    price_label: Optional[str] = None
    bedrooms_summary: Optional[str] = None
    area_from: Optional[Decimal] = None
    area_to: Optional[Decimal] = None
    area_unit: str
    rera_number: Optional[str] = None
    primary_image_url: Optional[str] = None
    property_type_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Detailed representation for single project page and admin editing
class ProjectDetailResponse(ProjectBase):
    id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    country: Optional[CountryResponse] = None
    state: Optional[StateResponse] = None
    city: Optional[CityResponse] = None
    locality: Optional[LocalityResponse] = None
    property_type: Optional[PropertyTypeResponse] = None
    amenities: List[AmenityResponse] = []
    configurations: List[ProjectConfigurationResponse] = []
    media: List[ProjectMediaResponse] = []
    videos: List[ProjectVideoResponse] = []
    documents: List[ProjectDocumentResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ProjectFilterParams(BaseModel):
    q: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    locality_id: Optional[int] = None
    property_type_id: Optional[int] = None
    bhk: Optional[str] = None  # e.g., "2 BHK", "3 BHK"
    status: Optional[str] = None
    construction_status: Optional[str] = None
    featured: Optional[bool] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    sort_by: Optional[str] = "created_at"  # created_at, price_asc, price_desc, name
