"""Debug and Explain routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.ai.ai_factory import get_ai_service
from app.models.user import User
from app.models.session import CodeSession
from app.models.ai_request import AIRequest
from app.schemas.debug_explain import (
    DebugRequest, DebugResponse, IssueDetail,
    ExplainRequest, ExplainResponse, SectionDetail,
)

router = APIRouter(prefix="/api", tags=["Debug & Explain"])


@router.post("/debug", response_model=DebugResponse)
def debug_code(
    request: DebugRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze code for bugs and return structured debugging information."""
    ai_service = get_ai_service()
    result = ai_service.debug_code(request.code, request.language, request.error_message)

    session = CodeSession(
        user_id=current_user.id,
        session_type="debug",
        language=request.language,
        input_prompt=request.code,
        output_code=result.corrected_code,
        output_explanation=result.overall_explanation,
        output_raw=json.dumps({
            "has_issues": result.has_issues,
            "issues": result.issues,
            "corrected_code": result.corrected_code,
        }),
    )
    db.add(session)
    db.flush()

    ai_log = AIRequest(
        session_id=session.id,
        user_id=current_user.id,
        request_type="debug",
        tokens_used=result.tokens_used,
        status="success" if result.success else "error",
        error_message=result.error,
    )
    db.add(ai_log)
    db.commit()

    if not result.success:
        raise HTTPException(status_code=502, detail=f"AI service error: {result.error}")

    # Convert raw issue dicts to IssueDetail models
    issues = []
    for issue in result.issues:
        issues.append(IssueDetail(
            line=issue.get("line"),
            severity=issue.get("severity", "warning"),
            category=issue.get("category", "logic"),
            problem=issue.get("problem", ""),
            explanation=issue.get("explanation", ""),
            fix=issue.get("fix", ""),
        ))

    return DebugResponse(
        success=True,
        session_id=session.id,
        language=result.language,
        has_issues=result.has_issues,
        overall_explanation=result.overall_explanation,
        issues=issues,
        corrected_code=result.corrected_code,
    )


@router.post("/explain", response_model=ExplainResponse)
def explain_code(
    request: ExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Explain the purpose and logic of the provided code."""
    ai_service = get_ai_service()
    result = ai_service.explain_code(request.code, request.language)

    session = CodeSession(
        user_id=current_user.id,
        session_type="explain",
        language=request.language,
        input_prompt=request.code,
        output_explanation=result.purpose,
        output_raw=json.dumps({
            "purpose": result.purpose,
            "logic_breakdown": result.logic_breakdown,
            "important_sections": result.important_sections,
            "potential_issues": result.potential_issues,
        }),
    )
    db.add(session)
    db.flush()

    ai_log = AIRequest(
        session_id=session.id,
        user_id=current_user.id,
        request_type="explain",
        tokens_used=result.tokens_used,
        status="success" if result.success else "error",
        error_message=result.error,
    )
    db.add(ai_log)
    db.commit()

    if not result.success:
        raise HTTPException(status_code=502, detail=f"AI service error: {result.error}")

    sections = [
        SectionDetail(section=s.get("section", ""), explanation=s.get("explanation", ""))
        for s in result.important_sections
    ]

    return ExplainResponse(
        success=True,
        session_id=session.id,
        language=result.language,
        purpose=result.purpose,
        logic_breakdown=result.logic_breakdown,
        important_sections=sections,
        potential_issues=result.potential_issues,
    )
