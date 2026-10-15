from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permission import Permission
from app.models import User
from app.schemas.response import ApiResponse, Page
from app.schemas.tenants import TenantCreateReq, TenantUpdateReq, TenantOut

from app.db.deps import get_db, require_permission
from app.services.tenant import get_all_tenants, get_tenant_page, create_tenant_service, update_tenant, delete_tenant

router = APIRouter(prefix="/tenants")


@router.get("/all")
async def all_tenants(db: AsyncSession = Depends(get_db)):
    tenants = await get_all_tenants(db)
    return ApiResponse.ok([TenantOut.model_validate(t) for t in tenants])


@router.get("", response_model=ApiResponse[Page[TenantOut]])
async def list_tenants(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
        keyword: str | None = None,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(require_permission(Permission.TENANT_MANAGE))
):
    items, total = await get_tenant_page(db, page, page_size, keyword)
    result = Page(items=[TenantOut.model_validate(t) for t in items], total=total, page=page, page_size=page_size)
    return ApiResponse.ok(result)


@router.post("", response_model=ApiResponse[TenantOut])
async def create(
        new_tenant: TenantCreateReq,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(require_permission(Permission.TENANT_MANAGE))
):
    tenant = await create_tenant_service(db, new_tenant)
    return ApiResponse.ok(TenantOut.model_validate(tenant))


@router.patch("/{tenant_id}", response_model=ApiResponse[TenantOut])
async def update(
        tenant_id: str,
        body: TenantUpdateReq,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_permission(Permission.TENANT_MANAGE))
):
    tenant = await update_tenant(db, tenant_id, body)
    return ApiResponse.ok(TenantOut.model_validate(tenant))


@router.delete("/{tenant_id}", response_model=ApiResponse[TenantOut])
async def delete(
        tenant_id: str,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(require_permission(Permission.TENANT_MANAGE))
):
    tenant = await delete_tenant(db, tenant_id)
    return ApiResponse.ok(tenant)
