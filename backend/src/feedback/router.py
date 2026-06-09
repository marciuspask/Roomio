import sentry_sdk
import structlog
from fastapi import APIRouter, status

from feedback.models import FeedbackCreate

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])
logger = structlog.get_logger(__name__)


@router.post("/", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def submit_feedback(body: FeedbackCreate) -> None:
    logger.info(
        "feedback_received",
        type=body.type,
        subject=body.subject,
        description=body.description,
    )

    with sentry_sdk.new_scope() as scope:
        scope.set_tag("feedback.type", body.type)
        scope.set_context("feedback", {
            "type": body.type,
            "subject": body.subject,
            "description": body.description,
        })
        sentry_sdk.capture_message(
            f"[Feedback] {body.type}: {body.subject}",
            level="info",
        )
