from pydantic import field_validator

from app.schemas.base import CamelModel
from app.schemas.tenants import TenantOut


class LoginRequest(CamelModel):
    username: str
    password: str
    tenant_code: str


class UserOut(CamelModel):
    id: str
    username: str
    name: str
    email: str
    status: str
    tenant_id: str
    roles: list[str] = []

    @field_validator("roles", mode="before")
    @classmethod
    def role_to_code(cls, v):
        return [r.code if hasattr(r, "code") else r for r in v]


class LoginResponse(CamelModel):
    access_token: str
    refresh_token: str
    user: UserOut
    tenant: TenantOut
    permissions: list[str] = []


class TokenResponse(CamelModel):
    access_token: str
    refresh_token: str


class RefreshRequest(CamelModel):
    refresh_token: str
