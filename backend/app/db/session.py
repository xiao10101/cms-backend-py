from sqlalchemy import event
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import Session, with_loader_criteria

from app.core.config import get_settings
from app.core.context import current_tenant_id
from app.db.base import TenantIdMixin

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=10,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


@event.listens_for(Session, "do_orm_execute")
def _inject_tenant_filter(execute_state):
    tenant_id = current_tenant_id.get()
    if tenant_id is None:
        return
    if (
            not execute_state.is_select
            or execute_state.is_column_load
            or execute_state.is_relationship_load
    ):
        return
    execute_state.statement = execute_state.statement.options(
        with_loader_criteria(
            TenantIdMixin,
            lambda cls: cls.tenant_id == tenant_id,
            include_aliases=True,
        )
    )
