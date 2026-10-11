from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import TenantOut
from app.schemas.response import ApiResponse

from app.db.deps import get_db
from app.services.tenant import get_all_tenants

router = APIRouter(prefix="/tenants")


@router.get("/all")
async def all_tenants(db: AsyncSession = Depends(get_db)):
    tenants = await get_all_tenants(db)
    return ApiResponse.ok([TenantOut.model_validate(t) for t in tenants])
