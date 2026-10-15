from app.schemas.base import CamelModel


class PermissionOut(CamelModel):
    code: str
    name: str
    group: str
