from typing import Annotated

from pydantic import StringConstraints

from app.schemas.base import CamelModel

RoleName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
RoleCode = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=50)]
RoleDescription = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=500)]


class RoleOut(CamelModel):
    id: str
    name: str
    code: str
    description: str | None = None
    permissions: list[str] = []


class RoleCreateReq(CamelModel):
    name: RoleName
    code: RoleCode
    description: RoleDescription
    permissions: list[str]


class RoleUpdateReq(CamelModel):
    name: RoleName | None = None
    description: RoleDescription | None = None
    permissions: list[str] | None = None
