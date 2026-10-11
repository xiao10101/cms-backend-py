import hashlib
from datetime import datetime, timezone, timedelta

from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exception import AppException
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models import Tenant, User, RefreshToken


def _issue_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
    """为用户签发新双 token 并将新 refresh 落库。不 commit——事务由调用方收口。"""
    access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hashlib.sha256(new_refresh_token.encode()).hexdigest(),
        expires_at=datetime.now(timezone.utc) + timedelta(days=get_settings().refresh_token_expire_days),
    ))
    return access_token, new_refresh_token


async def authenticate(db: AsyncSession, username: str, password: str, tenant_code: str):
    # 1. 查询租户
    tenant = (await db.execute(select(Tenant).where(Tenant.code == tenant_code))).scalar_one_or_none()
    if tenant is None:
        raise AppException(401, "用户名或密码错误")
    # select(User).where(User.tenant_id == tenant.id, User.username == username)
    user = (await db.execute(select(User).where(
        User.username == username,
        User.tenant_id == tenant.id)
    )).scalar_one_or_none()
    if user is None or not verify_password(password, user.password):
        raise AppException(401, "用户名或密码错误")

    access_token, refresh = _issue_tokens(db, user)
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    return user, tenant, access_token, refresh


# 接收 refreshToken → 验证 → 旧 token 吊销 → 签发新双 token → 新 refresh 落库
async def refresh_token(db: AsyncSession, token: str):
    # 1. 验证 token
    try:
        payload = decode_token(token)
    except InvalidTokenError:
        raise AppException(401, "token 无效")
    if payload.get("type") != "refresh_token":
        raise AppException(401, "token 无效")
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    record = (await db.execute(select(RefreshToken).where(
        RefreshToken.token_hash == token_hash
    ))).scalar_one_or_none()
    if record is None:
        raise AppException(401, "token 无效")
    if record.revoked_at is not None:
        raise AppException(401, "token 已失效")
    record.revoked_at = datetime.now(timezone.utc)

    user = await db.get(User, payload["sub"])
    if user is None:
        raise AppException(401, "token 无效")

    access_token, refresh = _issue_tokens(db, user)

    await db.commit()
    return access_token, refresh

async def logout_user(db: AsyncSession, token: str):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    record = (await db.execute(select(RefreshToken).where(
        RefreshToken.token_hash == token_hash
    ))).scalar_one_or_none()
    if record is None or record.revoked_at is not None:
        return
    record.revoked_at = datetime.now(timezone.utc)
    await db.commit()