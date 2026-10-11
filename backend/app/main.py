from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import (
    AppException,
    register_exception_handlers
)
from app.db.deps import get_db, get_current_user
from app.models import User
from app.schemas.response import ApiResponse
from app.core.config import get_settings
from app.api.v1.auth import router as auth_router
from app.api.v1.tenant import router as tenant_router

settings = get_settings()
app = FastAPI(title=settings.app_name, docs_url="/docs" if settings.debug else None)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(tenant_router, prefix="/api/v1")

register_exception_handlers(app)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/_echo")
async def echo(echo_string: str):
    if echo_string == "boom":
        raise AppException(404, "资源不存在")
    return ApiResponse.ok(echo_string)


@app.get("/api/v1/_db-check")
async def db_check(db: AsyncSession = Depends(get_db)):
    return {"session_type": type(db).__name__}


@app.get("/api/v1/_me")
async def me(user: User = Depends(get_current_user)):
    return {"username": user.username}
