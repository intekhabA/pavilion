from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, rate_limit_enquiry
from app.middleware.rate_limiter import get_client_ip
from app.schemas.common import APIResponse
from app.schemas.enquiry import EnquiryCreate
from app.services.enquiry_service import enquiry_service

router = APIRouter(prefix="/enquiries", tags=["Public Enquiries"], dependencies=[Depends(rate_limit_enquiry)])


@router.post("", response_model=APIResponse[dict])
def submit_enquiry(data: EnquiryCreate, request: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    ua = request.headers.get("User-Agent")
    enquiry = enquiry_service.create_enquiry(db, data, ip_address=ip, user_agent=ua)

    return APIResponse(
        message="Thank you for your enquiry! Our property consultant will contact you shortly.",
        data={"reference_id": enquiry.uuid},
    )
