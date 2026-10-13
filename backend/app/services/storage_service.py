import os
import shutil
import logging
import mimetypes
from typing import BinaryIO, Optional
from app.core.config import settings

logger = logging.getLogger("pavilion.storage")


class StorageService:
    def __init__(self):
        self.storage_type = (settings.STORAGE_TYPE or "local").lower().strip()
        self.media_dir = settings.MEDIA_DIR
        os.makedirs(self.media_dir, exist_ok=True)
        self.bucket_name = settings.AWS_BUCKET_NAME
        self.region = settings.AWS_REGION or "us-east-1"
        self.s3_client = None
        # Pre-signed URL expiration (7 days = 604800 seconds)
        self.presigned_url_expiration = int(os.getenv("S3_PRESIGNED_URL_EXPIRATION", "604800"))

        if self.storage_type == "s3":
            try:
                import boto3
                client_kwargs = {
                    "aws_access_key_id": settings.AWS_ACCESS_KEY_ID or None,
                    "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY or None,
                    "region_name": self.region,
                }
                if settings.AWS_ENDPOINT_URL:
                    client_kwargs["endpoint_url"] = settings.AWS_ENDPOINT_URL

                self.s3_client = boto3.client("s3", **client_kwargs)
                logger.info(f"S3 storage client initialized for bucket: {self.bucket_name} ({self.region})")
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}. Falling back to local storage.", exc_info=True)
                self.s3_client = None

    def _get_s3_key(self, file_url: str) -> Optional[str]:
        """Extract S3 key from various URL formats."""
        if not file_url:
            return None
        # Handle different URL formats - try multiple region patterns
        patterns = [
            f"{self.bucket_name}.s3.{self.region}.amazonaws.com/",
            f"{self.bucket_name}.s3.amazonaws.com/",
            f"/{self.bucket_name}/",
        ]
        # Also try common alternative regions
        common_regions = ["us-east-1", "us-west-1", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-southeast-2"]
        for r in common_regions:
            patterns.append(f"{self.bucket_name}.s3.{r}.amazonaws.com/")
        
        for pattern in patterns:
            if pattern in file_url:
                return file_url.split(pattern)[-1]
        return None

    def _generate_presigned_url(self, s3_key: str) -> str:
        """Generate a pre-signed URL for an S3 object."""
        if not self.s3_client:
            return ""
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": s3_key},
                ExpiresIn=self.presigned_url_expiration,
            )
            return url
        except Exception as e:
            logger.error(f"Failed to generate pre-signed URL for {s3_key}: {e}")
            return ""

    def save_file(self, file_obj: BinaryIO, filename: str, subfolder: str = "") -> str:
        """Saves a binary file to S3 or local disk and returns the accessible URL path."""
        relative_path = f"{subfolder}/{filename}".strip("/")

        # 1. Try S3 upload if configured
        if self.storage_type == "s3" and self.s3_client:
            try:
                file_obj.seek(0)
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    if filename.lower().endswith(".webp"):
                        content_type = "image/webp"
                    else:
                        content_type = "application/octet-stream"

                extra_args = {"ContentType": content_type}
                self.s3_client.upload_fileobj(
                    file_obj,
                    self.bucket_name,
                    relative_path,
                    ExtraArgs=extra_args,
                )

                # Generate pre-signed URL for private bucket access
                return self._generate_presigned_url(relative_path)
            except Exception as e:
                logger.error(f"S3 upload error for {relative_path}: {e}. Falling back to local disk.", exc_info=True)
                # Fall through to local disk save as safeguard

        # 2. Local disk fallback / default
        target_dir = os.path.join(self.media_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, filename)

        file_obj.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        return f"{settings.MEDIA_URL_PREFIX}/{relative_path}"

    def delete_file(self, file_url: str) -> bool:
        """Deletes a file given its media or S3 URL."""
        if not file_url:
            return False

        # 1. Delete from S3
        if self.storage_type == "s3" and self.s3_client:
            s3_key = self._get_s3_key(file_url)
            if s3_key:
                try:
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                    return True
                except Exception as e:
                    logger.error(f"S3 deletion failed for {file_url}: {e}")
                    return False

        # 2. Delete from local disk
        if file_url.startswith(settings.MEDIA_URL_PREFIX):
            relative_path = file_url[len(settings.MEDIA_URL_PREFIX):].lstrip("/")
            full_path = os.path.join(self.media_dir, relative_path)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                    return True
                except Exception:
                    return False
        return False

    def get_presigned_url(self, file_url: str) -> str:
        """Returns a fresh pre-signed URL for an S3 object, or the original URL for local files."""
        if not file_url:
            return ""
        
        # For local files, return as-is
        if file_url.startswith(settings.MEDIA_URL_PREFIX):
            return file_url
            
        # For S3, extract key and generate fresh pre-signed URL
        if self.storage_type == "s3" and self.s3_client:
            s3_key = self._get_s3_key(file_url)
            if s3_key:
                return self._generate_presigned_url(s3_key)
        
        return file_url


storage_service = StorageService()
