import re
import uuid
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from app.core.redis import get_cache, set_cache, delete_cache, delete_cache_pattern
from app.core.exceptions import NotFoundException, ConflictException
from app.models.project import (
    Project,
    PropertyType,
    Amenity,
    ProjectConfiguration,
    ProjectMedia,
    ProjectVideo,
    ProjectDocument,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectFilterParams,
    ProjectCardResponse,
    ProjectConfigurationCreate,
    ProjectVideoCreate,
)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[-\s]+", "-", text).strip("-")


class ProjectService:
    @staticmethod
    def _ensure_unique_slug(db: Session, base_slug: str, current_id: Optional[int] = None) -> str:
        slug = base_slug
        counter = 1
        while True:
            query = db.query(Project).filter(Project.slug == slug)
            if current_id:
                query = query.filter(Project.id != current_id)
            if not query.first():
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    @staticmethod
    def create_project(db: Session, data: ProjectCreate, user_id: Optional[int] = None) -> Project:
        slug = data.slug or slugify(data.name)
        slug = ProjectService._ensure_unique_slug(db, slug)

        project_dict = data.model_dump(exclude={"amenity_ids", "configurations", "videos"})
        project_dict["slug"] = slug
        project_dict["created_by"] = user_id

        project = Project(**project_dict)
        db.add(project)
        db.flush()  # to obtain project.id

        # Associate amenities
        if data.amenity_ids:
            amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
            project.amenities = amenities

        # Add configurations
        if data.configurations:
            for cfg in data.configurations:
                project_cfg = ProjectConfiguration(
                    project_id=project.id,
                    **cfg.model_dump(),
                )
                db.add(project_cfg)

        # Add videos
        if data.videos:
            for vid in data.videos:
                project_vid = ProjectVideo(
                    project_id=project.id,
                    **vid.model_dump(),
                )
                db.add(project_vid)

        db.commit()
        db.refresh(project)

        # Invalidate cache
        delete_cache_pattern("projects:*")
        return project

    @staticmethod
    def update_project(db: Session, project_id: int, data: ProjectUpdate) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("Project not found.")

        old_slug = project.slug
        update_data = data.model_dump(exclude_unset=True)

        if "slug" in update_data and update_data["slug"]:
            update_data["slug"] = ProjectService._ensure_unique_slug(db, slugify(update_data["slug"]), current_id=project.id)
        elif "name" in update_data and not update_data.get("slug"):
            # Update slug if explicitly wanted, or keep current
            pass

        if "amenity_ids" in update_data:
            amenity_ids = update_data.pop("amenity_ids")
            if amenity_ids is not None:
                amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
                project.amenities = amenities

        for key, value in update_data.items():
            setattr(project, key, value)

        db.commit()
        db.refresh(project)

        # Invalidate caches
        delete_cache_pattern("projects:*")
        delete_cache(f"project:{old_slug}")
        if project.slug != old_slug:
            delete_cache(f"project:{project.slug}")
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("Project not found.")
        slug = project.slug
        db.delete(project)
        db.commit()

        delete_cache_pattern("projects:*")
        delete_cache(f"project:{slug}")
        return True

    @staticmethod
    def set_publish_status(db: Session, project_id: int, status: str) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("Project not found.")
        project.status = status
        db.commit()
        db.refresh(project)

        delete_cache_pattern("projects:*")
        delete_cache(f"project:{project.slug}")
        return project

    @staticmethod
    def duplicate_project(db: Session, project_id: int, user_id: Optional[int] = None) -> Project:
        source = db.query(Project).filter(Project.id == project_id).first()
        if not source:
            raise NotFoundException("Source project not found.")

        new_name = f"{source.name} (Copy)"
        new_slug = ProjectService._ensure_unique_slug(db, slugify(new_name))

        new_project = Project(
            name=new_name,
            slug=new_slug,
            short_description=source.short_description,
            full_description=source.full_description,
            developer_name=source.developer_name,
            project_type=source.project_type,
            property_type_id=source.property_type_id,
            status="draft",
            construction_status=source.construction_status,
            featured=False,
            country_id=source.country_id,
            state_id=source.state_id,
            city_id=source.city_id,
            locality_id=source.locality_id,
            address=source.address,
            pincode=source.pincode,
            latitude=source.latitude,
            longitude=source.longitude,
            google_maps_url=source.google_maps_url,
            min_price=source.min_price,
            max_price=source.max_price,
            currency=source.currency,
            price_label=source.price_label,
            area_from=source.area_from,
            area_to=source.area_to,
            area_unit=source.area_unit,
            bedrooms_summary=source.bedrooms_summary,
            bathrooms_summary=source.bathrooms_summary,
            parking=source.parking,
            total_floors=source.total_floors,
            total_units=source.total_units,
            total_towers=source.total_towers,
            total_area_acres=source.total_area_acres,
            possession_date=source.possession_date,
            launch_date=source.launch_date,
            rera_number=source.rera_number,
            primary_image_url=source.primary_image_url,
            seo_title=f"Copy of {source.seo_title or source.name}",
            meta_description=source.meta_description,
            created_by=user_id,
        )
        db.add(new_project)
        db.flush()

        # Copy amenities
        new_project.amenities = list(source.amenities)

        # Copy configurations
        for cfg in source.configurations:
            new_cfg = ProjectConfiguration(
                project_id=new_project.id,
                name=cfg.name,
                bhk_type=cfg.bhk_type,
                super_area=cfg.super_area,
                carpet_area=cfg.carpet_area,
                area_unit=cfg.area_unit,
                price=cfg.price,
                price_label=cfg.price_label,
                bedrooms=cfg.bedrooms,
                bathrooms=cfg.bathrooms,
                balconies=cfg.balconies,
                floor_plan_image_url=cfg.floor_plan_image_url,
                availability_status=cfg.availability_status,
                description=cfg.description,
            )
            db.add(new_cfg)

        db.commit()
        db.refresh(new_project)
        delete_cache_pattern("projects:*")
        return new_project

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("Project not found.")
        return project

    @staticmethod
    def get_project_by_slug(db: Session, slug: str, public_only: bool = True) -> Project:
        cache_key = f"project:{slug}:{public_only}"
        cached = get_cache(cache_key)
        # We query the database with eager loaded relationships
        query = db.query(Project).filter(Project.slug == slug)
        if public_only:
            query = query.filter(Project.status == "published")
        project = query.first()
        if not project:
            raise NotFoundException(f"Project with slug '{slug}' not found.")
        return project

    @staticmethod
    def list_projects(
        db: Session,
        filters: ProjectFilterParams,
        page: int = 1,
        page_size: int = 12,
        public_only: bool = True,
    ) -> Tuple[List[Project], int]:
        query = db.query(Project)

        if public_only:
            query = query.filter(Project.status == "published")
        elif filters.status:
            query = query.filter(Project.status == filters.status)

        if filters.q:
            term = f"%{filters.q.strip()}%"
            query = query.filter(
                or_(
                    Project.name.ilike(term),
                    Project.developer_name.ilike(term),
                    Project.short_description.ilike(term),
                    Project.address.ilike(term),
                    Project.rera_number.ilike(term),
                )
            )

        if filters.country_id:
            query = query.filter(Project.country_id == filters.country_id)
        if filters.state_id:
            query = query.filter(Project.state_id == filters.state_id)
        if filters.city_id:
            query = query.filter(Project.city_id == filters.city_id)
        if filters.locality_id:
            query = query.filter(Project.locality_id == filters.locality_id)
        if filters.property_type_id:
            query = query.filter(Project.property_type_id == filters.property_type_id)
        if filters.construction_status:
            query = query.filter(Project.construction_status == filters.construction_status)
        if filters.featured is not None:
            query = query.filter(Project.featured == filters.featured)
        if filters.min_price is not None:
            query = query.filter(Project.min_price >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Project.max_price <= filters.max_price)
        if filters.bhk:
            query = query.filter(Project.bedrooms_summary.ilike(f"%{filters.bhk}%"))

        # Sorting
        if filters.sort_by == "price_asc":
            query = query.order_by(asc(Project.min_price))
        elif filters.sort_by == "price_desc":
            query = query.order_by(desc(Project.min_price))
        elif filters.sort_by == "name":
            query = query.order_by(asc(Project.name))
        else:
            query = query.order_by(desc(Project.featured), desc(Project.created_at))

        total = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def get_featured_projects(db: Session, limit: int = 6) -> List[Project]:
        return (
            db.query(Project)
            .filter(Project.status == "published", Project.featured.is_(True))
            .order_by(desc(Project.created_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_similar_projects(db: Session, project: Project, limit: int = 4) -> List[Project]:
        return (
            db.query(Project)
            .filter(
                Project.status == "published",
                Project.id != project.id,
                or_(
                    Project.city_id == project.city_id,
                    Project.property_type_id == project.property_type_id,
                ),
            )
            .order_by(desc(Project.featured), desc(Project.created_at))
            .limit(limit)
            .all()
        )


project_service = ProjectService()
