from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user, rate_limit_login
from app.core.exceptions import ValidationException
from app.core.security import hash_password, verify_password, validate_password_strength
from app.middleware.rate_limiter import get_client_ip
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
    PasswordChangeRequest,
)
from app.services.auth_service import auth_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=APIResponse[TokenResponse], dependencies=[Depends(rate_limit_login)])
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    ua = request.headers.get("User-Agent")
    user = auth_service.authenticate_user(db, data.email, data.password, ip_address=ip, user_agent=ua)
    access_token, refresh_token, expires_in = auth_service.create_tokens_for_user(
        db, user, ip_address=ip, user_agent=ua
    )

    audit_service.log_action(
        db, action="LOGIN", entity="user", entity_id=str(user.id),
        user_id=user.id, ip_address=ip, user_agent=ua, details={"email": user.email}
    )

    return APIResponse(
        message="Login successful",
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            user=UserResponse.model_validate(user),
        ),
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
def refresh_token(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    ua = request.headers.get("User-Agent")
    access_token, new_refresh_token, expires_in, user = auth_service.rotate_refresh_token(
        db, data.refresh_token, ip_address=ip, user_agent=ua
    )

    return APIResponse(
        message="Token refreshed successfully",
        data=TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=expires_in,
            user=UserResponse.model_validate(user),
        ),
    )


@router.post("/logout", response_model=APIResponse[None])
def logout(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    auth_service.logout(db, data.refresh_token)
    return APIResponse(message="Logged out successfully", data=None)


@router.post("/logout-all", response_model=APIResponse[None])
def logout_all_devices(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = auth_service.logout_all_devices(db, current_user.id)
    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="LOGOUT_ALL", entity="user", entity_id=str(current_user.id),
        user_id=current_user.id, ip_address=ip, details={"revoked_sessions": count}
    )
    return APIResponse(message=f"Revoked {count} active sessions across all devices.", data=None)


@router.get("/me", response_model=APIResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(
        message="Profile retrieved",
        data=UserResponse.model_validate(current_user),
    )


@router.post("/change-password", response_model=APIResponse[None])
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise ValidationException("Current password does not match.")

    valid, err_msg = validate_password_strength(data.new_password)
    if not valid:
        raise ValidationException(err_msg)

    current_user.password_hash = hash_password(data.new_password)
    # Revoke other sessions on password change
    auth_service.logout_all_devices(db, current_user.id)
    db.commit()

    return APIResponse(message="Password changed successfully. Please log in again.", data=None)
