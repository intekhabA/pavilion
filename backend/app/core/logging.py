import logging
import sys
from typing import Any, Dict


class CorrelationIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "correlation_id"):
            record.correlation_id = "-"
        return True


def setup_logging():
    log_format = "%(asctime)s | %(levelname)-7s | [%(correlation_id)s] | %(name)s : %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    
    # Add correlation filter to all handlers
    for handler in logging.root.handlers:
        handler.addFilter(CorrelationIdFilter())
        
    # Silence overly verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
