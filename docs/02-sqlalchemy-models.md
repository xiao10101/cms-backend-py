# 02 · SQLAlchemy 数据模型

> 字段与前端 `frontend/src/types/index.ts` 对齐。**命名约定**：数据库/模型用 `snake_case`（Python 惯例），API 用 `camelCase`（前端契约），由 Pydantic 的 `alias` 完成转换。状态字段用 `String` 存小写值，取值见注释。

## 1. 基础与引擎

```python
# app/db/base.py
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Table, Column, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def gen_id() -> str:
    return uuid.uuid4().hex


class Base(DeclarativeBase):
    pass
```

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

## 2. 模型定义

### 2.1 多对多关联表

```python
user_roles = Table(
    "user_roles", Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

content_tags = Table(
    "content_tags", Base.metadata,
    Column("content_id", ForeignKey("contents.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)
```

### 2.2 租户 / 用户 / 角色

```python
class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(50), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | disabled
    plan: Mapped[str] = mapped_column(String(20), default="基础版")      # 基础版|专业版|企业版
    max_users: Mapped[int] = mapped_column(Integer, default=20)
    contact_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("tenant_id", "username", name="uq_user_tenant_username"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    username: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    password: Mapped[str] = mapped_column(String(200))  # bcrypt hash，API 永不返回
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | disabled
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    roles: Mapped[list["Role"]] = relationship(secondary=user_roles, back_populates="users", lazy="selectin")


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (UniqueConstraint("tenant_id", "code", name="uq_role_tenant_code"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    permissions: Mapped[list] = mapped_column(JSONB, default=list)  # string[]，["*"] 表示全部
    built_in: Mapped[bool] = mapped_column(Boolean, default=False)

    users: Mapped[list["User"]] = relationship(secondary=user_roles, back_populates="roles", lazy="selectin")
```

### 2.3 栏目（自引用树）

```python
class Category(Base):
    __tablename__ = "categories"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100))
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent: Mapped["Category | None"] = relationship(remote_side="Category.id", back_populates="children")
    children: Mapped[list["Category"]] = relationship(back_populates="parent", lazy="selectin")
```

### 2.4 内容 / 多语言 / 版本

```python
class Content(Base):
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
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft|pending|approved|published|rejected|archived
    version: Mapped[int] = mapped_column(Integer, default=1)  # 乐观锁 + 版本号
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # 定时发布
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # 软删除

    category: Mapped["Category"] = relationship(lazy="selectin")
    author: Mapped["User"] = relationship(lazy="selectin")
    translations: Mapped[list["ContentTranslation"]] = relationship(back_populates="content", cascade="all, delete-orphan", lazy="selectin")
    versions: Mapped[list["ContentVersion"]] = relationship(back_populates="content", cascade="all, delete-orphan", lazy="selectin")
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


class ContentVersion(Base):
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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    content: Mapped["Content"] = relationship(back_populates="versions")
```

### 2.5 标签 / 审核 / 媒体 / 日志

```python
class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("tenant_id", "slug", name="uq_tag_tenant_slug"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    name: Mapped[str] = mapped_column(String(50))
    slug: Mapped[str] = mapped_column(String(50))
    color: Mapped[str] = mapped_column(String(20), default="#0052D9")

    contents: Mapped[list["Content"]] = relationship(secondary=content_tags, back_populates="tags")


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    content_id: Mapped[str] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"))
    submitter_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|approved|rejected
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    content: Mapped["Content"] = relationship(lazy="selectin")
    submitter: Mapped["User"] = relationship(foreign_keys=[submitter_id], lazy="selectin")
    reviewed_by: Mapped["User | None"] = relationship(foreign_keys=[reviewed_by_id], lazy="selectin")


class Media(Base):
    __tablename__ = "media"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    filename: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(500))
    mime_type: Mapped[str] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uploaded_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class OperationLog(Base):
    __tablename__ = "operation_logs"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    user_id: Mapped[str] = mapped_column(String(32))
    user_name: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(50))   # 更新内容 / 审核通过 ...
    module: Mapped[str] = mapped_column(String(50))   # 内容管理 / 审核中心 ...
    target: Mapped[str] = mapped_column(String(255))
    ip: Mapped[str | None] = mapped_column(String(50), nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(200))  # 存 hash，不存明文
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

## 3. 关键设计说明

### 3.1 多租户隔离
- 所有业务表带 `tenant_id`，在依赖注入层获取当前租户（`X-Tenant-Id`），查询时强制追加 `where(tenant_id=...)`。
- 可封装统一的 `query_for_tenant(model, tenant_id)` 或使用 SQLAlchemy 2.0 的 `with_loader_criteria` 自动注入过滤。

### 3.2 多语言
- 「主表 `Content` + 翻译表 `ContentTranslation`」，`content_id + locale` 唯一。
- 翻译独立加载、独立缓存，符合业务语义。

### 3.3 版本管理
- `ContentVersion` 存快照；`Content.version` 同时承担「版本号 + 乐观锁」。

### 3.4 审核状态机
- 流转：`draft → pending → approved → published → archived`，另有 `pending → rejected → draft`。
- `Review` 独立记录每次审核动作。

### 3.5 命名与序列化
- 模型用 `snake_case`，Pydantic schema 用 `alias` 映射为 `camelCase` 输出（见 03），保证与前端契约一致。
