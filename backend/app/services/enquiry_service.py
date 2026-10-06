import csv
import io
from datetime import datetime, timezone
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.core.exceptions import ValidationException, NotFoundException
from app.models.enquiry import Enquiry, EnquiryNote
from app.models.project import Project
from app.schemas.enquiry import EnquiryCreate, EnquiryFilterParams
from app.services.email_service import email_service


class EnquiryService:
    @staticmethod
    def create_enquiry(
        db: Session,
        data: EnquiryCreate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Enquiry:
        # 1. Anti-bot honeypot check
        if data.honeypot:
            raise ValidationException("Spam detected.")

        project_name = None
        if data.project_id:
            project = db.query(Project).filter(Project.id == data.project_id).first()
            if project:
                project_name = project.name

        enquiry = Enquiry(
            project_id=data.project_id,
            name=data.name.strip(),
            email=data.email.strip().lower(),
            phone=data.phone.strip(),
            country=data.country,
            message=data.message,
            preferred_bhk=data.preferred_bhk,
            budget_range=data.budget_range,
            source=data.source or "website",
            utm_source=data.utm_source,
            utm_medium=data.utm_medium,
            utm_campaign=data.utm_campaign,
            ip_address=ip_address,
            user_agent=user_agent,
            status="New",
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)

        # Send notification
        email_service.send_enquiry_notification(data.model_dump(), project_name)

        return enquiry

    @staticmethod
    def list_enquiries(
        db: Session,
        filters: EnquiryFilterParams,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Enquiry], int]:
        query = db.query(Enquiry)

        if filters.status:
            query = query.filter(Enquiry.status == filters.status)
        if filters.project_id:
            query = query.filter(Enquiry.project_id == filters.project_id)
        if filters.q:
            term = f"%{filters.q.strip()}%"
            query = query.filter(
                or_(
                    Enquiry.name.ilike(term),
                    Enquiry.email.ilike(term),
                    Enquiry.phone.ilike(term),
                    Enquiry.message.ilike(term),
                )
            )

        total = query.count()
        offset = (page - 1) * page_size
        items = query.order_by(desc(Enquiry.created_at)).offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def update_status(db: Session, enquiry_id: int, status: str) -> Enquiry:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise NotFoundException("Enquiry not found.")
        enquiry.status = status
        db.commit()
        db.refresh(enquiry)
        return enquiry

    @staticmethod
    def assign_user(db: Session, enquiry_id: int, user_id: Optional[int]) -> Enquiry:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise NotFoundException("Enquiry not found.")
        enquiry.assigned_to = user_id
        db.commit()
        db.refresh(enquiry)
        return enquiry

    @staticmethod
    def add_note(db: Session, enquiry_id: int, user_id: int, note_text: str) -> EnquiryNote:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise NotFoundException("Enquiry not found.")
        note = EnquiryNote(
            enquiry_id=enquiry_id,
            user_id=user_id,
            note=note_text.strip(),
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def export_csv(db: Session, filters: EnquiryFilterParams) -> str:
        query = db.query(Enquiry)
        if filters.status:
            query = query.filter(Enquiry.status == filters.status)
        if filters.project_id:
            query = query.filter(Enquiry.project_id == filters.project_id)
        enquiries = query.order_by(desc(Enquiry.created_at)).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Date", "Name", "Email", "Phone", "Project", "Status",
            "Preferred BHK", "Budget", "Source", "UTM Source", "Message"
        ])
        for e in enquiries:
            writer.writerow([
                e.id,
                e.created_at.strftime("%Y-%m-%d %H:%M:%S") if e.created_at else "",
                e.name,
                e.email,
                e.phone,
                e.project.name if e.project else "General",
                e.status,
                e.preferred_bhk or "",
                e.budget_range or "",
                e.source,
                e.utm_source or "",
                e.message or "",
            ])
        return output.getvalue()


enquiry_service = EnquiryService()
