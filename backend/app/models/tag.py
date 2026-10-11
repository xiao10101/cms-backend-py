from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint, String, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.base import Base, gen_id
from app.models.association import content_tags

if TYPE_CHECKING:
    from app.models.content import Content


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("tenant_id", "slug", name="uq_tag_tenant_slug"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(50))
    slug: Mapped[str] = mapped_column(String(50))
    color: Mapped[str] = mapped_column(String(20), default="#0052D9")

    contents: Mapped[list["Content"]] = relationship(secondary=content_tags, back_populates="tags")