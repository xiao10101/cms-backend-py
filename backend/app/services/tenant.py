from typing import List
from sqlalchemy import select, or_, func, ColumnElement
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import AppException
from app.models import Tenant
from app.schemas.tenants import TenantCreateReq, TenantUpdateReq


async def get_all_tenants(db: AsyncSession) -> List[Tenant]:
    result = await db.execute(
        select(Tenant)
        .order_by(Tenant.created_at.desc())
        .where(Tenant.deleted_at.is_(None))
    )

    return list(result.scalars().all())


async def get_tenant_page(
        db: AsyncSession,
        page: int,
        page_size: int,
        keyword: str | None = None,
) -> tuple[list[Tenant], int]:
    conditions: list[ColumnElement[bool]] = [Tenant.deleted_at.is_(None)]
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


async def update_tenant(db: AsyncSession, tenant_id: str, data: TenantUpdateReq) -> Tenant:
    tenant = await db.get(Tenant, tenant_id)
    if tenant is None:
        raise AppException(404, "租户不存在")
    # 第 2 步：本任务的灵魂——只取用户实际传了的字段
    updates = data.model_dump(exclude_unset=True)
    # 顺手判断：一个字段都没传 → 没什么可改的，直接返回原对象（幂等）
    if not updates:
        return tenant
    for field, value in updates.items():
        setattr(tenant, field, value)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppException(409, "租户code已存在")
    return tenant


async def delete_tenant(db: AsyncSession, tenant_id: str) -> Tenant:
    tenant = await db.get(Tenant, tenant_id)
    if tenant is None:
        raise AppException(404, "租户不存在")
    if tenant.deleted_at is not None:
        return tenant
    tenant.deleted_at = func.now()
    await db.commit()
    return tenant
