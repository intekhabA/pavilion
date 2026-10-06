from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class EnquiryNoteCreate(BaseModel):
    note: str = Field(..., min_length=1, max_length=2000)


class EnquiryNoteResponse(BaseModel):
    id: int
    note: str
    user_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class EnquiryCreate(BaseModel):
    project_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=25)
    country: Optional[str] = "India"
    message: Optional[str] = None
    preferred_bhk: Optional[str] = None
    budget_range: Optional[str] = None
    source: Optional[str] = "website"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    honeypot: Optional[str] = None  # Anti-bot honeypot field, must be empty


class EnquiryStatusUpdate(BaseModel):
    status: str = Field(..., description="New, Contacted, Qualified, Follow-up, Converted, Closed, Spam")


class EnquiryAssignUpdate(BaseModel):
    assigned_to: Optional[int] = None


class EnquiryResponse(BaseModel):
    id: int
    uuid: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    project_slug: Optional[str] = None
    name: str
    email: str
    phone: str
    country: Optional[str] = None
    message: Optional[str] = None
    preferred_bhk: Optional[str] = None
    budget_range: Optional[str] = None
    source: str
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    ip_address: Optional[str] = None
    status: str
    assigned_to: Optional[int] = None
    assigned_user_name: Optional[str] = None
    notes: List[EnquiryNoteResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class EnquiryFilterParams(BaseModel):
    status: Optional[str] = None
    project_id: Optional[int] = None
    q: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
