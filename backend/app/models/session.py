"""CodeSession ORM model — stores every AI interaction (generate/debug/explain)."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class SessionType(str, enum.Enum):
    generate = "generate"
    debug = "debug"
    explain = "explain"


class CodeSession(Base):
    __tablename__ = "code_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_type: Mapped[str] = mapped_column(String(20), nullable=False)  # generate/debug/explain
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="python")
    input_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    output_code: Mapped[str] = mapped_column(Text, nullable=True)
    output_explanation: Mapped[str] = mapped_column(Text, nullable=True)
    output_raw: Mapped[str] = mapped_column(Text, nullable=True)  # full JSON from AI
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="code_sessions")
    ai_requests = relationship("AIRequest", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CodeSession id={self.id} type={self.session_type} lang={self.language}>"
