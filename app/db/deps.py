from fastapi import Depends
from fastapi import Request
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import AppException
from app.core.security import decode_token
from app.db.session import async_session_factory
from app.models import User


async def get_db():
    async with async_session_factory() as session:
        yield session


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise AppException(401, "token 无效")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise AppException(401, "认证格式错误")
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise AppException(401, "token 已过期")
    except InvalidTokenError:
        raise AppException(401, "token 无效")
    if payload.get("type") != "access_token":
        raise AppException(401, "token 无效")
    user = await db.get(User, payload["sub"])
    if user is None:
        raise AppException(401, "token 无效")
    return user
