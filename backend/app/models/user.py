from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, gen_id
from app.models.association import user_roles

if TYPE_CHECKING:
    from app.models.role import Role


class User(Base, TimestampMixin):
    __tablename__ = "users"

    __table_args__ = (
        UniqueConstraint("tenant_id", "username", name="uq_user_tenant_username"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    username: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    password: Mapped[str] = mapped_column(String(200))  # bcrypt hash，API 永不返回
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | disabled
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    roles: Mapped[list["Role"]] = relationship(secondary=user_roles, back_populates="users", lazy="selectin")
