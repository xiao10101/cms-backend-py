from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, gen_id

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.content import Content


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    content_id: Mapped[str] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"))
    submitter_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|approved|rejected
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    content: Mapped["Content"] = relationship(lazy="selectin")
    submitter: Mapped["User"] = relationship(foreign_keys=[submitter_id], lazy="selectin")
    reviewed_by: Mapped["User | None"] = relationship(foreign_keys=[reviewed_by_id], lazy="selectin")
