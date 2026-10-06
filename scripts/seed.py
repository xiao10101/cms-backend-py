import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import async_session_factory
from app.models import Tenant


async def main():
    async with async_session_factory() as session:
        # 1. 租户：先查再插入
        tenant = (await session.execute(select(Tenant).where(Tenant.code == "yunshan"))).scalar_one_or_none()
        if tenant is None:
            tenant = Tenant(
                name="云杉科技集团",
                code="yunshan"
            )
            session.add(tenant)
            # 需要flush 一下，后面的 user 才能拿到id，不要提交事务，等用户创建完了再一起提交
            await session.flush()
        # 2.用户: 先查再插
        from app.models import User
        user = (await session.execute(select(User).where(User.name == "admin"))).scalar_one_or_none()
        if user is None:
            user = User(
                tenant_id=tenant.id, # type: ignore
                username="admin",
                name="刘洋",
                email="liuyang.yunshan@cms.com",
                password=hash_password("admin123"),
            )
            session.add(user)
        await session.commit()

if __name__ == '__main__':
    asyncio.run(main())