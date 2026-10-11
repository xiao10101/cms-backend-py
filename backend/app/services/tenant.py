from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Tenant


async def get_all_tenants(db: AsyncSession) -> List[Tenant]:
    result = await db.execute(
        select(Tenant).order_by(Tenant.created_at.desc())
    )

    return list(result.scalars().all())
