import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.api.dependencies import get_db, require_permission
from app.models.audit_log import AuditLog
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.audit_log import AuditLogResponse, AuditLogFilterParams

router = APIRouter(prefix="/admin/audit-logs", tags=["Admin Audit Logs"], dependencies=[Depends(require_permission("settings.manage"))])


@router.get("", response_model=APIResponse[PaginatedData[AuditLogResponse]])
def get_audit_logs(
    action: Optional[str] = None,
    entity: Optional[str] = None,
    user_id: Optional[int] = None,
    q: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                AuditLog.action.ilike(term),
                AuditLog.entity.ilike(term),
                AuditLog.details.ilike(term),
                AuditLog.ip_address.ilike(term),
            )
        )

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size).all()

    audit_list = [
        AuditLogResponse(
            id=a.id,
            user_id=a.user_id,
            user_name=f"{a.user.first_name} {a.user.last_name}" if a.user else "System",
            action=a.action,
            entity=a.entity,
            entity_id=a.entity_id,
            ip_address=a.ip_address,
            user_agent=a.user_agent,
            details=a.details,
            created_at=a.created_at,
        )
        for a in items
    ]

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return APIResponse(
        message="Audit logs retrieved",
        data=PaginatedData(
            items=audit_list,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )
