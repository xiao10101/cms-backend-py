from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas.auth import TenantOut
from app.schemas.response import ApiResponse, Page

from app.db.deps import get_db, get_current_user
from app.schemas.tenants import TenantCreateReq
from app.services.tenant import get_all_tenants, get_tenant_page, create_tenant_service

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
):
    items, total = await get_tenant_page(db, page, page_size, keyword)
    result = Page(items=[TenantOut.model_validate(t) for t in items], total=total, page=page, page_size=page_size)
    return ApiResponse.ok(result)


@router.post("", response_model=ApiResponse[TenantOut])
async def create(
        new_tenant: TenantCreateReq,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    tenant = await create_tenant_service(db, new_tenant)
    return ApiResponse.ok(TenantOut.model_validate(tenant))
