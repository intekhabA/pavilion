import json
import logging
from typing import Any, Optional
import redis
from app.core.config import settings

logger = logging.getLogger("pavilion.redis")

_redis_client: Optional[redis.Redis] = None
_memory_cache: dict[str, tuple[Any, float]] = {}


def get_redis_client() -> Optional[redis.Redis]:
    global _redis_client
    if not settings.REDIS_ENABLED:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD or None,
                db=settings.REDIS_DB,
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0,
            )
            _redis_client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to Redis: {e}. Falling back to in-memory caching.")
            _redis_client = None
    return _redis_client


def is_redis_healthy() -> bool:
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.ping())
    except Exception:
        return False


def get_cache(key: str) -> Optional[Any]:
    client = get_redis_client()
    if client:
        try:
            val = client.get(key)
            if val is not None:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Redis get_cache error for key {key}: {e}")
    # In-memory fallback
    if key in _memory_cache:
        import time
        val, expiry = _memory_cache[key]
        if time.time() < expiry:
            return val
        else:
            del _memory_cache[key]
    return None


def set_cache(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    ttl = ttl or settings.CACHE_DEFAULT_TTL
    client = get_redis_client()
    payload = json.dumps(value, default=str)
    if client:
        try:
            client.setex(key, ttl, payload)
            return True
        except Exception as e:
            logger.warning(f"Redis set_cache error for key {key}: {e}")
    # In-memory fallback
    import time
    _memory_cache[key] = (value, time.time() + ttl)
    return True


def delete_cache(key: str) -> bool:
    client = get_redis_client()
    if client:
        try:
            client.delete(key)
        except Exception as e:
            logger.warning(f"Redis delete_cache error for key {key}: {e}")
    _memory_cache.pop(key, None)
    return True


def delete_cache_pattern(pattern: str) -> int:
    deleted = 0
    client = get_redis_client()
    if client:
        try:
            keys = client.keys(pattern)
            if keys:
                deleted = client.delete(*keys)
        except Exception as e:
            logger.warning(f"Redis delete_cache_pattern error for pattern {pattern}: {e}")
    # In-memory clean
    prefix = pattern.replace("*", "")
    to_del = [k for k in _memory_cache.keys() if prefix in k]
    for k in to_del:
        del _memory_cache[k]
        deleted += 1
    return deleted
