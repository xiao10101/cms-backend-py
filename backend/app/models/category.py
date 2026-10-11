from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, gen_id, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100))
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    parent: Mapped["Category | None"] = relationship(remote_side="Category.id", back_populates="children")
    children: Mapped[list["Category"]] = relationship(back_populates="parent", lazy="selectin")