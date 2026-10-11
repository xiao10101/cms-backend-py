from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.db.base import Base, gen_id
from app.models.association import user_roles

if TYPE_CHECKING:
    from app.models.user import User


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (UniqueConstraint("tenant_id", "code", name="uq_role_tenant_code"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    permissions: Mapped[list] = mapped_column(JSONB, default=list)
    built_in: Mapped[bool] = mapped_column(Boolean, default=False)

    users: Mapped[list["User"]] = relationship(secondary=user_roles, back_populates="roles", lazy="selectin")
