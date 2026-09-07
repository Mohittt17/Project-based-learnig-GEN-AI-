"""Code generation route."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.ai.ai_factory import get_ai_service
from app.models.user import User
from app.models.session import CodeSession
from app.models.ai_request import AIRequest
from app.schemas.generate import GenerateRequest, GenerateResponse
import json

router = APIRouter(prefix="/api", tags=["Code Generation"])


@router.post("/generate", response_model=GenerateResponse)
def generate_code(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate code from a natural language prompt using AI."""
    ai_service = get_ai_service()
    result = ai_service.generate_code(request.prompt, request.language.value)

    # Persist the session regardless of success/failure for history
    session = CodeSession(
        user_id=current_user.id,
        session_type="generate",
        language=request.language.value,
        input_prompt=request.prompt,
        output_code=result.code if result.success else None,
        output_explanation=result.explanation if result.success else None,
        output_raw=json.dumps({
            "code": result.code,
            "explanation": result.explanation,
            "suggestions": result.suggestions,
        }),
    )
    db.add(session)
    db.flush()  # get session.id before creating AIRequest

    ai_log = AIRequest(
        session_id=session.id,
        user_id=current_user.id,
        request_type="generate",
        tokens_used=result.tokens_used,
        status="success" if result.success else "error",
        error_message=result.error,
    )
    db.add(ai_log)
    db.commit()

    if not result.success:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {result.error}",
        )

    return GenerateResponse(
        success=True,
        session_id=session.id,
        language=result.language,
        code=result.code,
        explanation=result.explanation,
        suggestions=result.suggestions,
    )
