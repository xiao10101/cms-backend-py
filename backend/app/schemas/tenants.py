from typing import Literal, Annotated

from pydantic import EmailStr, StringConstraints, Field

from app.schemas.base import CamelModel

TenantName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
TenantCode = Annotated[
    str, StringConstraints(
        strip_whitespace=True,
        to_lower=True,
        min_length=2,
        max_length=50,
        pattern=r"^[a-z0-9-]+$",
    )
]


class TenantCreateReq(CamelModel):
    name: TenantName
    code: TenantCode
    plan: Literal["基础版", "专业版", "企业版"] = "基础版"
    max_users: int = Field(default=20, ge=1, le=10000)
    contact_name: TenantName | None = None
    contact_email: EmailStr | None = None
