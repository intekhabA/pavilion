from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.public_projects import router as public_projects_router
from app.api.v1.public_locations import router as public_locations_router
from app.api.v1.public_enquiries import router as public_enquiries_router
from app.api.v1.admin_projects import router as admin_projects_router
from app.api.v1.admin_locations import router as admin_locations_router
from app.api.v1.admin_amenities import router as admin_amenities_router
from app.api.v1.admin_enquiries import router as admin_enquiries_router
from app.api.v1.admin_users import router as admin_users_router
from app.api.v1.admin_dashboard import router as admin_dashboard_router
from app.api.v1.admin_audit import router as admin_audit_router
from app.api.v1.admin_media import router as admin_media_router
from app.api.v1.admin_settings import router as admin_settings_router

api_router = APIRouter()

# Public Routes
api_router.include_router(public_projects_router)
api_router.include_router(public_locations_router)
api_router.include_router(public_enquiries_router)

# Auth Routes
api_router.include_router(auth_router)

# Admin CMS Routes
api_router.include_router(admin_dashboard_router)
api_router.include_router(admin_projects_router)
api_router.include_router(admin_locations_router)
api_router.include_router(admin_amenities_router)
api_router.include_router(admin_enquiries_router)
api_router.include_router(admin_users_router)
api_router.include_router(admin_audit_router)
api_router.include_router(admin_media_router)
api_router.include_router(admin_settings_router)
