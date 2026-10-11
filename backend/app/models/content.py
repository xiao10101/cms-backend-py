from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Index, String, ForeignKey, Integer, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, gen_id, TimestampMixin
from app.models.association import content_tags

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User
    from app.models.tag import Tag


class Content(Base, TimestampMixin):
    __tablename__ = "contents"
    __table_args__ = (
        Index("ix_content_tenant_status", "tenant_id", "status"),
        Index("ix_content_tenant_category", "tenant_id", "category_id"),
        Index("ix_content_tenant_scheduled", "tenant_id", "scheduled_at"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"))
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    # draft|pending|approved|published|rejected|archived
    status: Mapped[str] = mapped_column(String(20), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)  # 乐观锁 + 版本号
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # 软删除
    category: Mapped["Category"] = relationship(lazy="selectin")
    author: Mapped["User"] = relationship(lazy="selectin")
    translations: Mapped[list["ContentTranslation"]] = relationship(
        back_populates="content",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    versions: Mapped[list["ContentVersion"]] = relationship(
        back_populates="content",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    tags: Mapped[list["Tag"]] = relationship(secondary=content_tags, back_populates="contents", lazy="selectin")


class ContentTranslation(Base):
    __tablename__ = "content_translations"
    __table_args__ = (UniqueConstraint("content_id", "locale", name="uq_translation_content_locale"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    content_id: Mapped[str] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"))
    locale: Mapped[str] = mapped_column(String(10))  # zh-CN | en-US
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[str] = mapped_column(Text)  # 富文本 HTML
    seo_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    content: Mapped["Content"] = relationship(back_populates="translations")


class ContentVersion(Base, TimestampMixin):
    __tablename__ = "content_versions"
    __table_args__ = (UniqueConstraint("content_id", "version", name="uq_version_content_version"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    content_id: Mapped[str] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"))
    version: Mapped[int] = mapped_column(Integer)  # 快照版本号
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[str] = mapped_column(Text)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    change_note: Mapped[str | None] = mapped_column(String(500), nullable=True)

    content: Mapped["Content"] = relationship(back_populates="versions")
