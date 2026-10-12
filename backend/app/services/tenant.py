from typing import List

from sqlalchemy import select, or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import AppException
from app.models import Tenant
from app.schemas.tenants import TenantCreateReq


async def get_all_tenants(db: AsyncSession) -> List[Tenant]:
    result = await db.execute(
        select(Tenant).order_by(Tenant.created_at.desc())
    )

    return list(result.scalars().all())


async def get_tenant_page(
        db: AsyncSession,
        page: int,
        page_size: int,
        keyword: str | None = None,
) -> tuple[list[Tenant], int]:
    conditions = []
    if keyword:
        conditions.append(or_(
            Tenant.name.ilike(f"%{keyword}%"),
            Tenant.code.ilike(f"%{keyword}%")
        ))
    count_stmt = select(func.count()).select_from(Tenant)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
    total: int = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    items_stmt = (
        select(Tenant)
        .where(*conditions)
        .order_by(Tenant.created_at.desc())
        .limit(page_size)
        .offset(offset)
    )
    items = list((await db.execute(items_stmt)).scalars().all())
    return items, total


async def create_tenant_service(
        db: AsyncSession,
        new_tenant: TenantCreateReq,
) -> Tenant:
    db_tenant = (await db.execute(
        select(Tenant).where(Tenant.code == new_tenant.code)
    )).scalar_one_or_none()
    if db_tenant is not None:
        raise AppException(409, "租户已存在")
    tenant = Tenant(
        name=new_tenant.name,
        code=new_tenant.code,
        max_users=new_tenant.max_users,
        plan=new_tenant.plan,
        contact_name=new_tenant.contact_name,
        contact_email=new_tenant.contact_email,
    )
    db.add(tenant)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()  # ← 失败的事务要显式回滚，session 才能继续用
        raise AppException(409, "租户 code 已存在")
    await db.refresh(tenant)
    return tenant
