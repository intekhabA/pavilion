import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.enquiry import (
    EnquiryResponse,
    EnquiryFilterParams,
    EnquiryStatusUpdate,
    EnquiryAssignUpdate,
    EnquiryNoteCreate,
    EnquiryNoteResponse,
)
from app.services.enquiry_service import enquiry_service

router = APIRouter(prefix="/admin/enquiries", tags=["Admin Enquiries"], dependencies=[Depends(require_permission("leads.view"))])


def to_enquiry_response(e) -> EnquiryResponse:
    notes_res = [
        EnquiryNoteResponse(
            id=n.id,
            note=n.note,
            user_name=f"{n.user.first_name} {n.user.last_name}" if n.user else "System",
            created_at=n.created_at,
        )
        for n in e.notes
    ]
    return EnquiryResponse(
        id=e.id,
        uuid=e.uuid,
        project_id=e.project_id,
        project_name=e.project.name if e.project else "General Enquiry",
        project_slug=e.project.slug if e.project else None,
        name=e.name,
        email=e.email,
        phone=e.phone,
        country=e.country,
        message=e.message,
        preferred_bhk=e.preferred_bhk,
        budget_range=e.budget_range,
        source=e.source,
        utm_source=e.utm_source,
        utm_medium=e.utm_medium,
        utm_campaign=e.utm_campaign,
        ip_address=e.ip_address,
        status=e.status,
        assigned_to=e.assigned_to,
        assigned_user_name=f"{e.assigned_user.first_name} {e.assigned_user.last_name}" if e.assigned_user else None,
        notes=notes_res,
        created_at=e.created_at,
        updated_at=e.updated_at,
    )


@router.get("", response_model=APIResponse[PaginatedData[EnquiryResponse]])
def get_enquiries(
    status: Optional[str] = None,
    project_id: Optional[int] = None,
    q: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=15, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = EnquiryFilterParams(status=status, project_id=project_id, q=q)
    items, total = enquiry_service.list_enquiries(db, filters=filters, page=page, page_size=page_size)

    enquiry_list = [to_enquiry_response(e) for e in items]
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return APIResponse(
        message="Enquiries retrieved",
        data=PaginatedData(
            items=enquiry_list,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.put("/{enquiry_id}/status", response_model=APIResponse[EnquiryResponse])
def update_status(
    enquiry_id: int,
    data: EnquiryStatusUpdate,
    current_user: User = Depends(require_permission("leads.update")),
    db: Session = Depends(get_db),
):
    enquiry = enquiry_service.update_status(db, enquiry_id, data.status)
    return APIResponse(message="Status updated", data=to_enquiry_response(enquiry))


@router.put("/{enquiry_id}/assign", response_model=APIResponse[EnquiryResponse])
def assign_user(
    enquiry_id: int,
    data: EnquiryAssignUpdate,
    current_user: User = Depends(require_permission("leads.update")),
    db: Session = Depends(get_db),
):
    enquiry = enquiry_service.assign_user(db, enquiry_id, data.assigned_to)
    return APIResponse(message="Lead assigned successfully", data=to_enquiry_response(enquiry))


@router.post("/{enquiry_id}/notes", response_model=APIResponse[EnquiryNoteResponse])
def add_note(
    enquiry_id: int,
    data: EnquiryNoteCreate,
    current_user: User = Depends(require_permission("leads.update")),
    db: Session = Depends(get_db),
):
    note = enquiry_service.add_note(db, enquiry_id, current_user.id, data.note)
    return APIResponse(
        message="Note added",
        data=EnquiryNoteResponse(
            id=note.id,
            note=note.note,
            user_name=f"{current_user.first_name} {current_user.last_name}",
            created_at=note.created_at,
        ),
    )


@router.get("/export/csv")
def export_leads_csv(
    status: Optional[str] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    filters = EnquiryFilterParams(status=status, project_id=project_id)
    csv_data = enquiry_service.export_csv(db, filters=filters)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=pavilion_leads.csv"},
    )
