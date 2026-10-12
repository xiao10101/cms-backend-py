from contextvars import ContextVar

current_tenant_id = ContextVar[str | None]("current_tenant_id", default=None)
