from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.project import ProjectCardResponse
from app.schemas.enquiry import EnquiryResponse
from app.schemas.audit_log import AuditLogResponse


class ChartDataPoint(BaseModel):
    label: str
    value: int


class DashboardStatsResponse(BaseModel):
    total_projects: int
    published_projects: int
    draft_projects: int
    featured_projects: int
    total_enquiries: int
    new_enquiries: int
    converted_enquiries: int
    total_users: int
    system_health: Dict[str, Any]
    enquiries_by_month: List[ChartDataPoint]
    projects_by_city: List[ChartDataPoint]
    recent_projects: List[ProjectCardResponse]
    recent_enquiries: List[EnquiryResponse]
    recent_audit_logs: List[AuditLogResponse]
