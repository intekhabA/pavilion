import time
from typing import Optional
from fastapi import Request
from app.core.redis import get_redis_client
from app.core.exceptions import RateLimitExceededException

# In-memory sliding window fallback
_rate_limit_memory: dict[str, list[float]] = {}


def check_rate_limit(key: str, limit: int, window_seconds: int = 60) -> bool:
    """
    Checks and records rate limits using Redis or in-memory fallback.
    Returns True if allowed, raises RateLimitExceededException if exceeded.
    """
    from app.core.config import settings
    if settings.APP_ENV == "testing":
        return True

    client = get_redis_client()
    now = time.time()
    redis_key = f"rate_limit:{key}"

    if client:
        try:
            pipe = client.pipeline()
            pipe.zremrangebyscore(redis_key, 0, now - window_seconds)
            pipe.zcard(redis_key)
            pipe.zadd(redis_key, {str(now): now})
            pipe.expire(redis_key, window_seconds)
            _, count, _, _ = pipe.execute()
            if count >= limit:
                raise RateLimitExceededException()
            return True
        except RateLimitExceededException:
            raise
        except Exception:
            pass  # Fall through to in-memory

    # In-memory fallback
    timestamps = _rate_limit_memory.get(key, [])
    valid_timestamps = [t for t in timestamps if now - t < window_seconds]
    if len(valid_timestamps) >= limit:
        _rate_limit_memory[key] = valid_timestamps
        raise RateLimitExceededException()

    valid_timestamps.append(now)
    _rate_limit_memory[key] = valid_timestamps
    return True


def get_client_ip(request: Request) -> str:
    """Extracts client IP considering reverse proxy headers like X-Forwarded-For."""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    x_real_ip = request.headers.get("X-Real-IP")
    if x_real_ip:
        return x_real_ip.strip()
    return request.client.host if request.client else "unknown"
