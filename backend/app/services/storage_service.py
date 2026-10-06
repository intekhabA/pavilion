import os
import shutil
from typing import BinaryIO
from app.core.config import settings


class StorageService:
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.media_dir = settings.MEDIA_DIR
        os.makedirs(self.media_dir, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, filename: str, subfolder: str = "") -> str:
        """Saves a binary file and returns the accessible public URL path."""
        target_dir = os.path.join(self.media_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, filename)

        file_obj.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        relative_path = f"{subfolder}/{filename}".strip("/")
        return f"{settings.MEDIA_URL_PREFIX}/{relative_path}"

    def delete_file(self, file_url: str) -> bool:
        """Deletes a file given its media URL."""
        if not file_url.startswith(settings.MEDIA_URL_PREFIX):
            return False
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
