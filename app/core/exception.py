from fastapi import Request, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.logger import logger

from starlette import status
from starlette.responses import JSONResponse
from app.core.config import get_settings
from app.schemas.response import ApiResponse


def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("未处理异常", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ApiResponse.fail(code=500, message="服务器内部错误").model_dump(by_alias=True),
    )


class AppException(Exception):
    """业务异常基类——业务代码只允许抛它和它的子类"""

    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def app_exception_handler(request: Request, exc: Exception):
    assert isinstance(exc, AppException)
    return JSONResponse(
        status_code=exc.code,  # HTTP 状态码 = 业务 code（docs/03 错误码表就是 HTTP 语义）
        content=ApiResponse.fail(exc.code, exc.message).model_dump(by_alias=True),
    )


def app_validation_exception_handler(request: Request, exc: Exception):
    assert isinstance(exc, RequestValidationError)
    detail = exc.errors() if get_settings().debug else None
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ApiResponse.fail(400, "参数校验失败", detail).model_dump(by_alias=True) # type: ignore[override]
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, app_validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
