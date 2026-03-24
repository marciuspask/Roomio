import logging

import structlog


def configure_logging(debug: bool = False) -> None:
    """Configure structlog for the application.

    Call once at startup (in lifespan) before any log lines fire.
    All modules use: logger = structlog.get_logger(__name__)
    """
    log_level = logging.DEBUG if debug else logging.INFO

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        logger_factory=structlog.PrintLoggerFactory(),
    )
