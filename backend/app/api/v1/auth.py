from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import AppException
from app.db.deps import get_db, get_current_user, get_current_tenant_id
from app.models import User
from app.schemas.auth import LoginRequest, LoginResponse, UserOut, TenantOut, TokenResponse, RefreshRequest
from app.schemas.response import ApiResponse
from app.services.auth import authenticate, refresh_token, logout_user

router = APIRouter(prefix="/auth")


@router.post('/login', response_model=ApiResponse[LoginResponse])
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, tenant, access, refresh_token_str = await authenticate(db, body.username, body.password, body.tenant_code)
    return ApiResponse.ok(LoginResponse(
        access_token=access,
        refresh_token=refresh_token_str,
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant),
        permissions=[],
    ))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    access, new_refresh = await refresh_token(db, body.refresh_token)
    return ApiResponse.ok(TokenResponse(access_token=access, refresh_token=new_refresh))

@router.post("/logout", response_model=ApiResponse)
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await logout_user(db, body.refresh_token)
    return ApiResponse.ok(None)


@router.get("/profile", response_model=ApiResponse[UserOut])
async def profile(user: User = Depends(get_current_user), tenant_id: str = Depends(get_current_tenant_id)):
    user.tenant_id = tenant_id
    return ApiResponse.ok(UserOut.model_validate(user))

@router.get("/tenant-debug")
async def tenant_debug(
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id),   # ← 关键：先 set 上下文
):
    result = await db.execute(select(User))
    return {"count": len(result.scalars().all()), "tenant_id": tenant_id}

@router.patch("/debug/users/{user_id}/status")
async def debug_update_user_staus(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id),
):
    result = await db.execute(
        update(User)
        .where(
            User.id == user_id,
            User.tenant_id == tenant_id
        )
        .values(status='active')
    )
    await db.commit()
    if result.rowcount == 0:
        raise AppException(404, "用户不存在")
    return ApiResponse.ok(None)