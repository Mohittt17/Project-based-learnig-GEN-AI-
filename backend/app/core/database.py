"""
Database engine, session factory, and Base declarative class.
SQLAlchemy is configured for SQLite in development.
To switch to PostgreSQL, change DATABASE_URL in .env — no other code changes needed.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

# SQLite-specific: enable WAL mode for better concurrent access
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=settings.debug,  # logs SQL in debug mode
)

# Enable foreign key enforcement for SQLite (disabled by default in SQLite)
if settings.database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def get_db():
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called at application startup."""
    # Import all models so Base knows about them before creating tables
    import app.models.user  # noqa: F401
    import app.models.session  # noqa: F401
    import app.models.ai_request  # noqa: F401
    Base.metadata.create_all(bind=engine)
