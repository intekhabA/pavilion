import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # General
    APP_NAME: str = "Pavilion Realty API"
    APP_ENV: str = "development"  # development, staging, production
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "super-secret-key-change-in-production-pavilion-2025-token"
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production-pavilion-2025-auth"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15

    # Database
    MYSQL_HOST: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "realestate_user"
    MYSQL_PASSWORD: str = "realestate_secret"
    MYSQL_DATABASE: str = "realestate_db"
    DATABASE_URL: str = ""
    USE_SQLITE_FALLBACK: bool = True

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if not self.MYSQL_USER or self.MYSQL_HOST in ("", "none"):
            return "sqlite:///./realestate.db"
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"

    # Redis
    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_ENABLED: bool = True
    CACHE_DEFAULT_TTL: int = 300  # 5 minutes

    # Storage
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    MEDIA_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../media/uploads"))
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
    ALLOWED_DOC_EXTENSIONS: List[str] = [".pdf", ".doc", ".docx"]

    # S3 (Production Object Storage)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_BUCKET_NAME: str = "pavilion-media"
    AWS_ENDPOINT_URL: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    FRONTEND_URL: str = "http://localhost:3000"
    ADMIN_URL: str = "http://localhost:3000/admin"

    # Rate Limiting (per minute / hour)
    RATE_LIMIT_LOGIN_PER_MIN: int = 5
    RATE_LIMIT_RESET_PER_HOUR: int = 3
    RATE_LIMIT_ENQUIRY_PER_MIN: int = 5
    RATE_LIMIT_GENERAL_PER_MIN: int = 120
    RATE_LIMIT_ADMIN_PER_MIN: int = 300

    # Email / SMTP
    SMTP_ENABLED: bool = False
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@pavilionrealty.com"
    SMTP_FROM_NAME: str = "Pavilion Realty"
    ADMIN_NOTIFICATION_EMAIL: str = "admin@pavilionrealty.com"

    # Initial Admin Seed Credentials
    INITIAL_ADMIN_EMAIL: str = "admin@pavilionrealty.com"
    INITIAL_ADMIN_PASSWORD: str = "Admin@Pavilion2025!"
    INITIAL_ADMIN_FIRST_NAME: str = "System"
    INITIAL_ADMIN_LAST_NAME: str = "Admin"


settings = Settings()
