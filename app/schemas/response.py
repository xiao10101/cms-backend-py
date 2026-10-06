from typing import Generic, TypeVar, Any
from app.schemas.base import CamelModel

T = TypeVar("T")


class ApiResponse(CamelModel, Generic[T]):
    code: int
    message: str
    data: T | None = None

    @classmethod
    def ok(cls, data: T):
        return cls(code=0, message="ok", data=data)

    @classmethod
    def fail(cls, code: int, message: str, data: Any=None):
        return cls(code=code, message=message, data=data)
