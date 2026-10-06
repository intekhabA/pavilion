from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base
from app.models.base import TimestampMixin


class WebsiteSetting(Base, TimestampMixin):
    __tablename__ = "website_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    group = Column(String(50), default="general", nullable=False)  # general, seo, contact, social
    description = Column(String(255), nullable=True)
