from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings
from app.db.base import gen_id

pwd_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_hasher.verify(plain_password, hashed_password)


def _create_token(subject: str, token_type: str, expires_delta: timedelta):
    settings = get_settings()
    payload: dict = {
        "sub": subject,
        "type": token_type,
        "jti": gen_id(),
        "exp": datetime.now(timezone.utc) + expires_delta,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, key=settings.secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(sub: str) -> str:
    return _create_token(sub, 'access_token', timedelta(minutes=get_settings().access_token_expire_minutes))


def create_refresh_token(sub: str):
    return _create_token(sub, 'refresh_token', timedelta(days=get_settings().refresh_token_expire_days))


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])

