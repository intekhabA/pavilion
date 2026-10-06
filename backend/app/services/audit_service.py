import json
import logging
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

logger = logging.getLogger("pavilion.audit")


class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        entity: str,
        entity_id: Optional[str] = None,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Any] = None,
    ) -> AuditLog:
        """Records an audit log entry in the database."""
        details_str = None
        if details is not None:
            if isinstance(details, (dict, list)):
                # Sanitize sensitive fields before persisting
                clean_details = AuditService._sanitize(details)
                details_str = json.dumps(clean_details, default=str)
            else:
                details_str = str(details)

        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id is not None else None,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details_str,
        )
        try:
            db.add(audit_entry)
            db.commit()
            db.refresh(audit_entry)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record audit log: {e}")
        return audit_entry

    @staticmethod
    def _sanitize(data: Any) -> Any:
        sensitive_keys = {"password", "password_hash", "token", "refresh_token", "secret", "authorization"}
        if isinstance(data, dict):
            return {
                k: ("[REDACTED]" if k.lower() in sensitive_keys else AuditService._sanitize(v))
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [AuditService._sanitize(item) for item in data]
        return data


audit_service = AuditService()
