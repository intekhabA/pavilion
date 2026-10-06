from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AuditLogFilterParams(BaseModel):
    user_id: Optional[int] = None
    action: Optional[str] = None
    entity: Optional[str] = None
    q: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
