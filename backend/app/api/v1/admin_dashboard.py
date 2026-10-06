from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.api.dependencies import get_db, require_permission
from app.core.redis import is_redis_healthy
from app.models.project import Project
from app.models.enquiry import Enquiry
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.location import City
from app.schemas.common import APIResponse
from app.schemas.dashboard import DashboardStatsResponse, ChartDataPoint
from app.schemas.audit_log import AuditLogResponse
from app.api.v1.public_projects import to_project_card
from app.api.v1.admin_enquiries import to_enquiry_response

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"], dependencies=[Depends(require_permission("dashboard.view"))])


@router.get("/stats", response_model=APIResponse[DashboardStatsResponse])
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    published_projects = db.query(Project).filter(Project.status == "published").count()
    draft_projects = db.query(Project).filter(Project.status == "draft").count()
    featured_projects = db.query(Project).filter(Project.featured.is_(True)).count()

    total_enquiries = db.query(Enquiry).count()
    new_enquiries = db.query(Enquiry).filter(Enquiry.status == "New").count()
    converted_enquiries = db.query(Enquiry).filter(Enquiry.status == "Converted").count()
    total_users = db.query(User).count()

    # System Health
    redis_ok = is_redis_healthy()
    system_health = {
        "status": "healthy",
        "database": "connected",
        "redis_cache": "connected" if redis_ok else "fallback_in_memory",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # Projects by City Chart Data
    city_counts = (
        db.query(City.name, func.count(Project.id))
        .join(Project, Project.city_id == City.id)
        .group_by(City.name)
        .order_by(func.count(Project.id).desc())
        .limit(6)
        .all()
    )
    projects_by_city = [ChartDataPoint(label=name, value=count) for name, count in city_counts]

    # Enquiries monthly trends
    now = datetime.now(timezone.utc)
    enquiries_by_month = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i in range(5, -1, -1):
        target_month_date = now - timedelta(days=i * 30)
        m_name = month_names[target_month_date.month - 1]
        cnt = db.query(Enquiry).filter(
            func.extract("month", Enquiry.created_at) == target_month_date.month
        ).count()
        enquiries_by_month.append(ChartDataPoint(label=m_name, value=cnt))

    # Recent projects
    recent_projects_objs = db.query(Project).order_by(desc(Project.created_at)).limit(5).all()
    recent_projects = [to_project_card(p) for p in recent_projects_objs]

    # Recent enquiries
    recent_enquiry_objs = db.query(Enquiry).order_by(desc(Enquiry.created_at)).limit(5).all()
    recent_enquiries = [to_enquiry_response(e) for e in recent_enquiry_objs]

    # Recent audit logs
    recent_audit_objs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(8).all()
    recent_audit_logs = [
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
        for a in recent_audit_objs
    ]

    return APIResponse(
        message="Dashboard statistics retrieved",
        data=DashboardStatsResponse(
            total_projects=total_projects,
            published_projects=published_projects,
            draft_projects=draft_projects,
            featured_projects=featured_projects,
            total_enquiries=total_enquiries,
            new_enquiries=new_enquiries,
            converted_enquiries=converted_enquiries,
            total_users=total_users,
            system_health=system_health,
            enquiries_by_month=enquiries_by_month,
            projects_by_city=projects_by_city,
            recent_projects=recent_projects,
            recent_enquiries=recent_enquiries,
            recent_audit_logs=recent_audit_logs,
        ),
    )
