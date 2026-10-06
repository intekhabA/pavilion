from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class WebsiteSettingResponse(BaseModel):
    id: int
    key: str
    value: str
    group: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class WebsiteSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None
