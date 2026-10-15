from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permission import Permission
from app.db.deps import get_db, require_permission, get_current_tenant_id
from app.schemas.response import ApiResponse, Page
from app.schemas.roles import RoleOut, RoleCreateReq, RoleUpdateReq
from app.services.roles import get_role_page, create_role_service, delete_role_service, update_role_service

router = APIRouter(prefix="/roles")


@router.get("", response_model=ApiResponse[Page[RoleOut]])
async def list_roles(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
        db: AsyncSession = Depends(get_db),
        tenant_id: str = Depends(get_current_tenant_id),
        _: None = Depends(require_permission(Permission.ROLE_MANAGE)),
):
    items, total = await get_role_page(db, tenant_id, page, page_size)
    result = Page(items=[RoleOut.model_validate(item) for item in items], total=total, page=page, page_size=page_size)
    return ApiResponse.ok(result)


@router.post("", response_model=ApiResponse[RoleOut])
async def create_a_role(
        new_role: RoleCreateReq,
        db: AsyncSession = Depends(get_db),
        tenant_id: str = Depends(get_current_tenant_id),
        _: None = Depends(require_permission(Permission.ROLE_MANAGE))
):
    role = await create_role_service(db, tenant_id, new_role)
    return ApiResponse.ok(RoleOut.model_validate(role))


@router.delete("/{role_id}", response_model=ApiResponse[RoleOut])
async def delete_a_role(
        role_id: str,
        db: AsyncSession = Depends(get_db),
        tenant_id: str = Depends(get_current_tenant_id),
        _: None = Depends(require_permission(Permission.ROLE_MANAGE))
):
    result = await delete_role_service(db, role_id, tenant_id)
    return ApiResponse.ok(RoleOut.model_validate(result))


@router.patch("/{role_id}", response_model=ApiResponse[RoleOut])
async def update_a_role(
        role_id: str,
        body: RoleUpdateReq,
        tenant_id: str = Depends(get_current_tenant_id),
        db: AsyncSession = Depends(get_db),
        _: None = Depends(require_permission(Permission.ROLE_MANAGE))
):
    role = await update_role_service(db, role_id, tenant_id, body)
    return ApiResponse.ok(RoleOut.model_validate(role))
