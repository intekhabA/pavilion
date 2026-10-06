from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Country(Base, TimestampMixin):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, index=True, nullable=False)  # "IN", "AE", etc.
    currency_code = Column(String(10), default="INR", nullable=False)
    currency_symbol = Column(String(10), default="₹", nullable=False)
    phone_code = Column(String(10), default="+91", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    states = relationship("State", back_populates="country", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="country")


class State(Base, TimestampMixin):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    country = relationship("Country", back_populates="states")
    cities = relationship("City", back_populates="state", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="state")


class City(Base, TimestampMixin):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), index=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    state = relationship("State", back_populates="cities")
    localities = relationship("Locality", back_populates="city", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="city")


class Locality(Base, TimestampMixin):
    __tablename__ = "localities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), index=True, nullable=False)
    pincode = Column(String(20), nullable=True)
    is_popular = Column(Boolean, default=False, nullable=False)

    city = relationship("City", back_populates="localities")
    projects = relationship("Project", back_populates="locality")
