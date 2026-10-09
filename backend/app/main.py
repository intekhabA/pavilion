import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import engine, Base
from app.core.redis import is_redis_healthy, get_redis_client
from app.core.exceptions import AppException
from app.middleware.correlation_id import CorrelationIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.api.v1.api import api_router
import app.models  # Ensure all models are registered with Base.metadata

setup_logging()
logger = logging.getLogger("pavilion.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' mode...")
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)

    # Initialize tables if SQLite or development auto-sync
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.warning(f"Database schema auto-sync notice: {e}")

    # Check Redis
    get_redis_client()

    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready Real Estate Platform & CMS API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Middlewares
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "Content-Disposition"],
)

# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "data": exc.data,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append({"field": loc, "message": err.get("msg")})

    correlation_id = getattr(request.state, "correlation_id", "-")
    logger.warning(f"Validation error [{correlation_id}] on {request.method} {request.url.path}: {errors}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation error",
            "error_code": "VALIDATION_ERROR",
            "data": {"errors": errors},
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "-")
    logger.error(f"Unhandled error [{correlation_id}]: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
            "data": None,
        },
    )


# Health and Readiness Probes
@app.get("/health", tags=["Health"])
def health_check():
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.error(f"DB health check failed: {e}")

    redis_ok = is_redis_healthy()

    overall_ok = db_ok  # App is operational if DB is up
    return JSONResponse(
        status_code=status.HTTP_200_OK if overall_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "healthy" if overall_ok else "unhealthy",
            "database": "connected" if db_ok else "disconnected",
            "redis": "connected" if redis_ok else "fallback_mode",
            "environment": settings.APP_ENV,
        },
    )


@app.get("/ready", tags=["Health"])
def ready_check():
    return {"ready": True}


# Mount Media directory for local static uploads
if os.path.exists(settings.MEDIA_DIR):
    app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media")

# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
