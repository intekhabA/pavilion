import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Table,
    Text,
    Numeric,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

# Many-to-Many association for Project and Amenities
project_amenities = Table(
    "project_amenities",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class PropertyType(Base):
    __tablename__ = "property_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    icon = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    projects = relationship("Project", back_populates="property_type")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default="General", nullable=False)  # Sports, Leisure, Safety, Convenience, Eco
    icon = Column(String(50), nullable=True)  # lucide icon name
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    projects = relationship("Project", secondary=project_amenities, back_populates="amenities")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    developer_name = Column(String(200), index=True, nullable=False)
    project_type = Column(String(50), default="Residential", nullable=False)  # Residential, Commercial, Mixed
    property_type_id = Column(Integer, ForeignKey("property_types.id", ondelete="SET NULL"), nullable=True, index=True)

    # Status & Flags
    status = Column(String(50), default="draft", index=True, nullable=False)  # draft, published, archived
    construction_status = Column(String(50), default="Under Construction", nullable=False)  # Ready to Move, Under Construction, New Launch
    featured = Column(Boolean, default=False, index=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    # Location
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    locality_id = Column(Integer, ForeignKey("localities.id"), nullable=True, index=True)
    address = Column(Text, nullable=True)
    pincode = Column(String(20), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    google_maps_url = Column(String(1000), nullable=True)

    # Pricing & Specifications
    min_price = Column(Numeric(15, 2), nullable=True, index=True)
    max_price = Column(Numeric(15, 2), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    price_label = Column(String(100), nullable=True)  # e.g., "₹ 1.85 Cr - 4.50 Cr"
    area_from = Column(Numeric(10, 2), nullable=True)
    area_to = Column(Numeric(10, 2), nullable=True)
    area_unit = Column(String(20), default="sq.ft", nullable=False)
    bedrooms_summary = Column(String(50), nullable=True)  # e.g., "2, 3, 4 BHK"
    bathrooms_summary = Column(String(50), nullable=True)
    parking = Column(String(50), nullable=True)
    total_floors = Column(Integer, nullable=True)
    total_units = Column(Integer, nullable=True)
    total_towers = Column(Integer, nullable=True)
    total_area_acres = Column(Numeric(8, 2), nullable=True)
    possession_date = Column(Date, nullable=True)
    launch_date = Column(Date, nullable=True)
    rera_number = Column(String(100), nullable=True, index=True)

    # Media cover
    primary_image_url = Column(String(500), nullable=True)

    # SEO
    seo_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    canonical_url = Column(String(500), nullable=True)
    og_image = Column(String(500), nullable=True)
    is_indexable = Column(Boolean, default=True, nullable=False)

    # Creator
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    property_type = relationship("PropertyType", back_populates="projects", lazy="joined")
    country = relationship("Country", back_populates="projects", lazy="joined")
    state = relationship("State", back_populates="projects", lazy="joined")
    city = relationship("City", back_populates="projects", lazy="joined")
    locality = relationship("Locality", back_populates="projects", lazy="joined")
    amenities = relationship("Amenity", secondary=project_amenities, back_populates="projects", lazy="selectin")
    configurations = relationship("ProjectConfiguration", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    media = relationship("ProjectMedia", back_populates="project", cascade="all, delete-orphan", order_by="ProjectMedia.display_order", lazy="selectin")
    videos = relationship("ProjectVideo", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    documents = relationship("ProjectDocument", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    enquiries = relationship("Enquiry", back_populates="project", cascade="all, delete-orphan")


class ProjectConfiguration(Base):
    __tablename__ = "project_configurations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # e.g., "3 BHK Elite"
    bhk_type = Column(String(20), nullable=False)  # "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Plot", "Penthouse"
    super_area = Column(Numeric(10, 2), nullable=True)
    carpet_area = Column(Numeric(10, 2), nullable=True)
    area_unit = Column(String(20), default="sq.ft", nullable=False)
    price = Column(Numeric(15, 2), nullable=True)
    price_label = Column(String(100), nullable=True)  # e.g., "₹ 2.45 Cr"
    bedrooms = Column(Integer, default=1, nullable=False)
    bathrooms = Column(Integer, default=1, nullable=False)
    balconies = Column(Integer, default=1, nullable=False)
    floor_plan_image_url = Column(String(500), nullable=True)
    availability_status = Column(String(50), default="Available", nullable=False)
    description = Column(Text, nullable=True)

    project = relationship("Project", back_populates="configurations")


class ProjectMedia(Base):
    __tablename__ = "project_media"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    webp_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    alt_text = Column(String(255), nullable=True)
    caption = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="media")


class ProjectVideo(Base):
    __tablename__ = "project_videos"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    video_type = Column(String(20), default="youtube", nullable=False)  # "youtube", "custom"
    video_url = Column(String(500), nullable=False)
    youtube_video_id = Column(String(50), nullable=True)
    title = Column(String(200), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="videos")


class ProjectDocument(Base):
    __tablename__ = "project_documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    doc_type = Column(String(50), default="brochure", nullable=False)  # brochure, floor_plan, master_plan, legal
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="documents")
