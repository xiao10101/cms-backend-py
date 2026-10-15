from fastapi import APIRouter, Depends

from app.core.permission import PERMISSION_CATALOG
from app.db.deps import get_current_user
from app.models import User
from app.schemas.permission import PermissionOut
from app.schemas.response import ApiResponse

router = APIRouter(prefix="/permissions")


@router.get("", response_model=ApiResponse[list[PermissionOut]])
async def list_permissions(_: User = Depends(get_current_user)):
    return ApiResponse.ok([PermissionOut(**p) for p in PERMISSION_CATALOG])
