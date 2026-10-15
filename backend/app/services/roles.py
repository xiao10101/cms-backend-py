from sqlalchemy import ColumnElement, select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception import AppException
from app.models import Role, user_roles
from app.schemas.roles import RoleCreateReq, RoleUpdateReq


async def get_role_page(
        db: AsyncSession,
        tenant_id: str,
        page: int,
        page_size: int,
) -> tuple[list[Role], int]:
    conditions: list[ColumnElement[bool]] = [Role.deleted_at.is_(None), Role.tenant_id == tenant_id]
    count_stmt = select(func.count()).select_from(Role)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
    total: int = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    items_stmt = (
        select(Role)
        .where(*conditions)
        .order_by(Role.created_at.desc())
        .limit(page_size)
        .offset(offset)
    )
    items = list((await db.execute(items_stmt)).scalars().all())
    return items, total


async def create_role_service(db: AsyncSession, tenant_id: str, body: RoleCreateReq) -> Role:
    db_role = (await db.execute(
        select(Role).where(Role.code == body.code, Role.tenant_id == tenant_id)
    )).scalar_one_or_none()
    if db_role is None:
        new_role = Role(
            code=body.code,
            name=body.name,
            tenant_id=tenant_id,
            description=body.description,
            permissions=body.permissions,
        )
    elif db_role.deleted_at is not None:
        db_role.deleted_at = None
        new_role = db_role
        new_role.name = body.name
        new_role.description = body.description
        new_role.permissions = body.permissions
    else:
        raise AppException(409, "角色编码已存在")
    db.add(new_role)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppException(409, "角色已存在")
    await db.refresh(new_role)
    return new_role


async def delete_role_service(
        db: AsyncSession,
        role_id: str,
        tenant_id: str,
):
    role = (await db.execute(
        select(Role).where(Role.id == role_id, Role.tenant_id == tenant_id)
    )).scalar_one_or_none()
    if role is None:
        raise AppException(404, "角色不存在")
    if role.deleted_at is not None:
        raise AppException(404, "角色不存在")
    if role.built_in:
        raise AppException(409, "内置角色不可删除")
    occupied = (await db.execute(
        select(func.count())
        .select_from(user_roles)
        .where(user_roles.c.role_id == role.id)
    )).scalar() or 0
    if occupied > 0:
        raise AppException(409, f"该角色仍被 {occupied} 个用户使用，请先调整这些用户的角色")
    role.deleted_at = func.now()
    await db.commit()
    return role


async def update_role_service(
        db: AsyncSession,
        role_id: str,
        tenant_id: str,
        data: RoleUpdateReq
) -> Role:
    role = (await db.execute(
        select(Role).where(Role.id == role_id, Role.tenant_id == tenant_id)
    )).scalar_one_or_none()
    if role is None:
        raise AppException(404, "角色不存在")
    if role.deleted_at is not None:
        raise AppException(404, "角色不存在")
    if role.built_in:
        raise AppException(409, "内置角色不可修改")
    updates = data.model_dump(exclude_unset=True)
    if not updates:
        return role
    for field, value in updates.items():
        setattr(role, field, value)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppException(409, "角色已存在")
    return role
