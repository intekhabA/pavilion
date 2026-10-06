from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
)
from app.core.exceptions import UnauthorizedException, AppException
from app.models.user import User, RefreshToken, LoginHistory


class AuthService:
    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> User:
        """Validates credentials, manages lockout logic, and logs authentication events."""
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        now = datetime.now(timezone.utc)

        if not user:
            # Record failed login attempt for unknown user
            db.add(LoginHistory(
                user_id=None,
                email_attempted=email,
                status="failed",
                ip_address=ip_address,
                user_agent=user_agent,
            ))
            db.commit()
            raise UnauthorizedException("Invalid email or password.", error_code="INVALID_CREDENTIALS")

        # Check account lockout
        if user.locked_until:
            locked_until_utc = user.locked_until.replace(tzinfo=timezone.utc) if user.locked_until.tzinfo is None else user.locked_until
            if locked_until_utc > now:
                db.add(LoginHistory(
                    user_id=user.id,
                    email_attempted=email,
                    status="locked",
                    ip_address=ip_address,
                    user_agent=user_agent,
                ))
                db.commit()
                remaining = int((locked_until_utc - now).total_seconds() / 60) + 1
                raise UnauthorizedException(
                    f"Account temporarily locked due to failed attempts. Try again in {remaining} minute(s).",
                    error_code="ACCOUNT_LOCKED",
                )
            else:
                # Lockout period expired
                user.locked_until = None
                user.failed_login_attempts = 0

        # Check active status
        if not user.is_active:
            raise UnauthorizedException("Account is inactive. Contact the administrator.", error_code="ACCOUNT_INACTIVE")

        # Verify password
        if not verify_password(password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.locked_until = now + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
                status_str = "locked"
            else:
                status_str = "failed"

            db.add(LoginHistory(
                user_id=user.id,
                email_attempted=email,
                status=status_str,
                ip_address=ip_address,
                user_agent=user_agent,
            ))
            db.commit()
            raise UnauthorizedException("Invalid email or password.", error_code="INVALID_CREDENTIALS")

        # Successful login: reset attempts and record
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = now
        db.add(LoginHistory(
            user_id=user.id,
            email_attempted=email,
            status="success",
            ip_address=ip_address,
            user_agent=user_agent,
        ))
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def create_tokens_for_user(
        db: Session,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[str, str, int]:
        """Issues access token and rotating refresh token, storing the hash in DB."""
        access_token = create_access_token(
            subject=user.id,
            claims={"email": user.email, "role": user.role.slug if user.role else "viewer"},
        )
        refresh_token = create_refresh_token(subject=user.id)

        # Store hashed refresh token
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        db_token = RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(db_token)
        db.commit()

        expires_in = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return access_token, refresh_token, expires_in

    @staticmethod
    def rotate_refresh_token(
        db: Session,
        old_refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[str, str, int, User]:
        """Validates existing refresh token, revokes it, and issues a new pair."""
        payload = decode_token(old_refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token.", error_code="INVALID_TOKEN")

        user_id = int(payload.get("sub"))
        old_hash = hash_token(old_refresh_token)

        token_record = (
            db.query(RefreshToken)
            .filter(RefreshToken.user_id == user_id, RefreshToken.token_hash == old_hash)
            .first()
        )

        if not token_record or token_record.revoked_at is not None:
            # Token reuse detected! Revoke all tokens for user to protect account
            db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update(
                {"revoked_at": datetime.now(timezone.utc)}
            )
            db.commit()
            raise UnauthorizedException("Refresh token reuse detected. All sessions revoked.", error_code="TOKEN_REVOKED")

        # Revoke old token
        token_record.revoked_at = datetime.now(timezone.utc)

        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise UnauthorizedException("User account is inactive or not found.", error_code="USER_INACTIVE")

        # Create new tokens
        access_token, new_refresh_token, expires_in = AuthService.create_tokens_for_user(
            db, user, ip_address, user_agent
        )
        return access_token, new_refresh_token, expires_in, user

    @staticmethod
    def logout(db: Session, refresh_token: str) -> bool:
        """Revokes a single refresh token on logout."""
        token_hash_val = hash_token(refresh_token)
        record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash_val).first()
        if record:
            record.revoked_at = datetime.now(timezone.utc)
            db.commit()
            return True
        return False

    @staticmethod
    def logout_all_devices(db: Session, user_id: int) -> int:
        """Revokes all active refresh tokens for the user."""
        count = (
            db.query(RefreshToken)
            .filter(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .update({"revoked_at": datetime.now(timezone.utc)})
        )
        db.commit()
        return count


auth_service = AuthService()
