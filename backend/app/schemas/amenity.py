from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AmenityResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    icon: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class AmenityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    category: str = "General"
    icon: Optional[str] = None


class PropertyTypeResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)


class PropertyTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    slug: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
