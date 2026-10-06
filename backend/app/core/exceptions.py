from typing import Any, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        message: str = "An error occurred",
        error_code: str = "GENERIC_ERROR",
        data: Optional[Any] = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.error_code = error_code
        self.data = data


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, message=message, error_code=error_code)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", error_code: str = "UNAUTHORIZED"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, message=message, error_code=error_code)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied", error_code: str = "FORBIDDEN"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message=message, error_code=error_code)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict", error_code: str = "CONFLICT"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, message=message, error_code=error_code)


class RateLimitExceededException(AppException):
    def __init__(self, message: str = "Too many requests. Please try again later.", error_code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, message=message, error_code=error_code)


class ValidationException(AppException):
    def __init__(self, message: str = "Invalid input data", error_code: str = "VALIDATION_ERROR", data: Optional[Any] = None):
        status_code = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
        super().__init__(status_code=status_code, message=message, error_code=error_code, data=data)
