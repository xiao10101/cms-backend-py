from pydantic import ConfigDict

from app.schemas.base import CamelModel


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
    roles: list[str] = []

class TenantOut(CamelModel):
    id: str
    name: str
    code: str
    status: str
    plan: str
    max_users: int

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