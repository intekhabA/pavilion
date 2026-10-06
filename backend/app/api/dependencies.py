from typing import Optional, Callable
from fastapi import Depends, Header, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.config import settings
from app.models.user import User
from app.middleware.rate_limiter import check_rate_limit, get_client_ip

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token_query: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials if credentials else token_query
    if not token:
        raise UnauthorizedException("Authentication token required.", error_code="TOKEN_MISSING")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired token.", error_code="TOKEN_INVALID")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload.", error_code="TOKEN_INVALID")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise UnauthorizedException("User no longer exists.", error_code="USER_NOT_FOUND")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive.", error_code="ACCOUNT_INACTIVE")

    return user


def require_permission(permission_name: str) -> Callable:
    """Dependency factory checking that authenticated user possesses required RBAC permission."""
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.has_permission(permission_name):
            return current_user
        raise ForbiddenException(
            f"Insufficient permissions. Required permission: '{permission_name}'",
            error_code="PERMISSION_DENIED",
        )
    return permission_checker


# Rate limiting dependencies
def rate_limit_login(request: Request):
    ip = get_client_ip(request)
    check_rate_limit(f"login:{ip}", limit=settings.RATE_LIMIT_LOGIN_PER_MIN, window_seconds=60)


def rate_limit_enquiry(request: Request):
    ip = get_client_ip(request)
    check_rate_limit(f"enquiry:{ip}", limit=settings.RATE_LIMIT_ENQUIRY_PER_MIN, window_seconds=60)


def rate_limit_general(request: Request):
    ip = get_client_ip(request)
    check_rate_limit(f"general:{ip}", limit=settings.RATE_LIMIT_GENERAL_PER_MIN, window_seconds=60)


def rate_limit_reset(request: Request):
    ip = get_client_ip(request)
    check_rate_limit(f"reset:{ip}", limit=settings.RATE_LIMIT_RESET_PER_HOUR, window_seconds=3600)
