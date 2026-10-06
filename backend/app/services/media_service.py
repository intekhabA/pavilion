import io
import os
import re
import uuid
from typing import Dict, Any, Optional, Tuple
from fastapi import UploadFile
from PIL import Image
from app.core.config import settings
from app.core.exceptions import ValidationException
from app.services.storage_service import storage_service

YOUTUBE_REGEX = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
)


class MediaService:
    @staticmethod
    def extract_youtube_id(url: str) -> Optional[str]:
        """Extracts and validates YouTube video ID from various URL formats."""
        match = YOUTUBE_REGEX.search(url.strip())
        if match:
            return match.group(1)
        return None

    @staticmethod
    def process_and_save_image(file: UploadFile, subfolder: str = "images") -> Dict[str, Any]:
        """
        Validates image, optimizes it, generates thumbnail and WebP variants,
        and saves files securely.
        """
        # 1. Validate file extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise ValidationException(
                f"Unsupported image format: {ext}. Allowed: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
            )

        # 2. Read bytes and check size
        contents = file.file.read()
        file_size = len(contents)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise ValidationException(f"Image exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB.")

        # 3. Validate image using PIL
        try:
            image = Image.open(io.BytesIO(contents))
            image.verify()  # Verify integrity
            image = Image.open(io.BytesIO(contents))  # Re-open for operations
        except Exception:
            raise ValidationException("Invalid or corrupted image file.")

        width, height = image.size
        orig_format = image.format or "JPEG"
        safe_base_name = f"{uuid.uuid4().hex[:12]}_{re.sub(r'[^a-zA-Z0-9_-]', '', os.path.splitext(file.filename or 'img')[0])[:30]}"

        # Convert palette/RGBA if saving as JPEG
        rgb_image = image.convert("RGB") if image.mode in ("RGBA", "P") else image

        # 4. Save original/optimized
        optimized_buffer = io.BytesIO()
        rgb_image.save(optimized_buffer, format="JPEG", quality=88, optimize=True)
        orig_filename = f"{safe_base_name}.jpg"
        file_url = storage_service.save_file(optimized_buffer, orig_filename, subfolder=subfolder)

        # 5. Generate WebP variant
        webp_buffer = io.BytesIO()
        rgb_image.save(webp_buffer, format="WEBP", quality=85, method=6)
        webp_filename = f"{safe_base_name}.webp"
        webp_url = storage_service.save_file(webp_buffer, webp_filename, subfolder=subfolder)

        # 6. Generate Thumbnail (max 400x300)
        thumb_image = rgb_image.copy()
        thumb_image.thumbnail((400, 300), Image.Resampling.LANCZOS)
        thumb_buffer = io.BytesIO()
        thumb_image.save(thumb_buffer, format="WEBP", quality=80)
        thumb_filename = f"{safe_base_name}_thumb.webp"
        thumbnail_url = storage_service.save_file(thumb_buffer, thumb_filename, subfolder=subfolder)

        return {
            "file_url": file_url,
            "webp_url": webp_url,
            "thumbnail_url": thumbnail_url,
            "file_name": file.filename or orig_filename,
            "file_size": file_size,
            "mime_type": "image/jpeg",
            "width": width,
            "height": height,
        }

    @staticmethod
    def process_and_save_document(file: UploadFile, subfolder: str = "documents") -> Dict[str, Any]:
        """Validates document format, size and saves securely."""
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in settings.ALLOWED_DOC_EXTENSIONS:
            raise ValidationException(
                f"Unsupported document format: {ext}. Allowed: {', '.join(settings.ALLOWED_DOC_EXTENSIONS)}"
            )

        contents = file.file.read()
        file_size = len(contents)
        max_bytes = 25 * 1024 * 1024  # 25MB for PDFs/docs
        if file_size > max_bytes:
            raise ValidationException("Document exceeds maximum size of 25MB.")

        # Disallow executable header signatures
        if contents.startswith(b"MZ") or contents.startswith(b"\x7fELF"):
            raise ValidationException("Executable files are strictly prohibited.")

        safe_base_name = f"{uuid.uuid4().hex[:12]}_{re.sub(r'[^a-zA-Z0-9_-]', '', os.path.splitext(file.filename or 'doc')[0])[:30]}"
        filename = f"{safe_base_name}{ext}"

        file_url = storage_service.save_file(io.BytesIO(contents), filename, subfolder=subfolder)

        return {
            "file_url": file_url,
            "file_name": file.filename or filename,
            "file_size": file_size,
            "mime_type": file.content_type or "application/pdf",
        }


media_service = MediaService()
