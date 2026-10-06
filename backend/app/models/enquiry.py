import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Enquiry(Base, TimestampMixin):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), index=True, nullable=False)
    country = Column(String(100), nullable=True)
    message = Column(Text, nullable=True)
    preferred_bhk = Column(String(50), nullable=True)
    budget_range = Column(String(100), nullable=True)
    source = Column(String(100), default="website", nullable=False)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    # Status: New, Contacted, Qualified, Follow-up, Converted, Closed, Spam
    status = Column(String(30), default="New", index=True, nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    project = relationship("Project", back_populates="enquiries", lazy="joined")
    assigned_user = relationship("User", foreign_keys=[assigned_to], lazy="joined")
    notes = relationship("EnquiryNote", back_populates="enquiry", cascade="all, delete-orphan", order_by="EnquiryNote.created_at.desc()", lazy="selectin")


class EnquiryNote(Base):
    __tablename__ = "enquiry_notes"

    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    enquiry = relationship("Enquiry", back_populates="notes")
    user = relationship("User", lazy="joined")
