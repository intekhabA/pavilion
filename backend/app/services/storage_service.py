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

    def save_file(self, file_obj: BinaryIO, filename: str, subfolder: str = "") -> str:
        """Saves a binary file to S3 or local disk and returns the accessible public URL path."""
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

                if settings.AWS_ENDPOINT_URL:
                    endpoint = settings.AWS_ENDPOINT_URL.rstrip("/")
                    return f"{endpoint}/{self.bucket_name}/{relative_path}"
                return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{relative_path}"
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
        if self.storage_type == "s3" and self.s3_client and (
            f"{self.bucket_name}.s3" in file_url or (settings.AWS_ENDPOINT_URL and settings.AWS_ENDPOINT_URL in file_url)
        ):
            try:
                # Extract S3 key
                if f"{self.bucket_name}.s3.{self.region}.amazonaws.com/" in file_url:
                    key = file_url.split(f"{self.bucket_name}.s3.{self.region}.amazonaws.com/")[-1]
                elif f"{self.bucket_name}.s3.amazonaws.com/" in file_url:
                    key = file_url.split(f"{self.bucket_name}.s3.amazonaws.com/")[-1]
                else:
                    key = file_url.split(f"/{self.bucket_name}/")[-1]

                self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
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


storage_service = StorageService()
