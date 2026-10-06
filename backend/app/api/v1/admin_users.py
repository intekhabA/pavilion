from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.core.security import hash_password, validate_password_strength
from app.middleware.rate_limiter import get_client_ip
from app.models.user import User, Role, Permission
from app.schemas.common import APIResponse
from app.schemas.auth import (
    UserCreate,
    UserUpdate,
    UserResponse,
    RoleResponse,
    PermissionResponse,
)
from app.services.audit_service import audit_service

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


@router.get("", response_model=APIResponse[List[UserResponse]])
def get_users(
    current_user: User = Depends(require_permission("users.view")),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.id.desc()).all()
    return APIResponse(data=[UserResponse.model_validate(u) for u in users])


@router.post("", response_model=APIResponse[UserResponse])
def create_user(
    data: UserCreate,
    request: Request,
    current_user: User = Depends(require_permission("users.create")),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise ConflictException("User with this email already exists.")

    valid, err_msg = validate_password_strength(data.password)
    if not valid:
        raise ValidationException(err_msg)

    role = db.query(Role).filter(Role.id == data.role_id).first()
    if not role:
        raise NotFoundException("Role not found.")

    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email.lower().strip(),
        phone=data.phone,
        password_hash=hash_password(data.password),
        role_id=data.role_id,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="USER_CREATE", entity="user", entity_id=str(new_user.id),
        user_id=current_user.id, ip_address=ip, details={"email": new_user.email, "role": role.slug}
    )

    return APIResponse(message="User created successfully", data=UserResponse.model_validate(new_user))


@router.put("/{user_id}", response_model=APIResponse[UserResponse])
def update_user(
    user_id: int,
    data: UserUpdate,
    request: Request,
    current_user: User = Depends(require_permission("users.update")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")

    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.phone is not None:
        user.phone = data.phone
    if data.role_id is not None:
        user.role_id = data.role_id
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.password:
        valid, err_msg = validate_password_strength(data.password)
        if not valid:
            raise ValidationException(err_msg)
        user.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(user)

    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="USER_UPDATE", entity="user", entity_id=str(user.id),
        user_id=current_user.id, ip_address=ip, details={"email": user.email}
    )

    return APIResponse(message="User updated successfully", data=UserResponse.model_validate(user))


@router.delete("/{user_id}", response_model=APIResponse[None])
def delete_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_permission("users.delete")),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise ValidationException("You cannot delete your own account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")

    email = user.email
    db.delete(user)
    db.commit()

    ip = get_client_ip(request)
    audit_service.log_action(
        db, action="USER_DELETE", entity="user", entity_id=str(user_id),
        user_id=current_user.id, ip_address=ip, details={"email": email}
    )
    return APIResponse(message="User deleted successfully", data=None)


@router.get("/roles", response_model=APIResponse[List[RoleResponse]])
def get_roles(
    current_user: User = Depends(require_permission("users.view")),
    db: Session = Depends(get_db),
):
    roles = db.query(Role).all()
    return APIResponse(data=[RoleResponse.model_validate(r) for r in roles])


@router.get("/permissions", response_model=APIResponse[List[PermissionResponse]])
def get_permissions(
    current_user: User = Depends(require_permission("users.view")),
    db: Session = Depends(get_db),
):
    perms = db.query(Permission).order_by(Permission.module.asc()).all()
    return APIResponse(data=[PermissionResponse.model_validate(p) for p in perms])
