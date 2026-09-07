"""History and dashboard stats routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import CodeSession
from app.models.ai_request import AIRequest

router = APIRouter(prefix="/api", tags=["History & Stats"])


class SessionSummary(BaseModel):
    id: str
    session_type: str
    language: str
    input_prompt: str
    output_explanation: Optional[str]
    created_at: str


class HistoryResponse(BaseModel):
    items: list[SessionSummary]
    total: int
    page: int
    page_size: int


class StatsResponse(BaseModel):
    total_sessions: int
    generate_count: int
    debug_count: int
    explain_count: int
    most_used_language: Optional[str]
    member_since: str


@router.get("/history", response_model=HistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    session_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated history of user's code sessions."""
    query = db.query(CodeSession).filter(CodeSession.user_id == current_user.id)

    if session_type and session_type in ("generate", "debug", "explain"):
        query = query.filter(CodeSession.session_type == session_type)

    total = query.count()
    sessions = (
        query.order_by(CodeSession.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        SessionSummary(
            id=s.id,
            session_type=s.session_type,
            language=s.language,
            input_prompt=s.input_prompt[:200] + "..." if len(s.input_prompt) > 200 else s.input_prompt,
            output_explanation=s.output_explanation[:300] + "..." if s.output_explanation and len(s.output_explanation) > 300 else s.output_explanation,
            created_at=s.created_at.isoformat(),
        )
        for s in sessions
    ]

    return HistoryResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/history/{session_id}")
def get_session_detail(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full details of a single code session."""
    session = (
        db.query(CodeSession)
        .filter(CodeSession.id == session_id, CodeSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "id": session.id,
        "session_type": session.session_type,
        "language": session.language,
        "input_prompt": session.input_prompt,
        "output_code": session.output_code,
        "output_explanation": session.output_explanation,
        "output_raw": session.output_raw,
        "created_at": session.created_at.isoformat(),
    }


@router.delete("/history/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a session from history."""
    session = (
        db.query(CodeSession)
        .filter(CodeSession.id == session_id, CodeSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics for the current user."""
    base = db.query(CodeSession).filter(CodeSession.user_id == current_user.id)

    total = base.count()
    generate_count = base.filter(CodeSession.session_type == "generate").count()
    debug_count = base.filter(CodeSession.session_type == "debug").count()
    explain_count = base.filter(CodeSession.session_type == "explain").count()

    # Most used language
    lang_result = (
        db.query(CodeSession.language, func.count(CodeSession.language).label("cnt"))
        .filter(CodeSession.user_id == current_user.id)
        .group_by(CodeSession.language)
        .order_by(func.count(CodeSession.language).desc())
        .first()
    )
    most_used_language = lang_result[0] if lang_result else None

    return StatsResponse(
        total_sessions=total,
        generate_count=generate_count,
        debug_count=debug_count,
        explain_count=explain_count,
        most_used_language=most_used_language,
        member_since=current_user.created_at.isoformat(),
    )
