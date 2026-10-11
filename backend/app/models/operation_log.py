from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, gen_id


class OperationLog(Base, TimestampMixin):
    __tablename__ = "operation_logs"
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    user_id: Mapped[str] = mapped_column(String(32))
    user_name: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(50))  # 更新内容 / 审核通过 ...
    module: Mapped[str] = mapped_column(String(50))  # 内容管理 / 审核中心 ...
    target: Mapped[str] = mapped_column(String(255))
    ip: Mapped[str | None] = mapped_column(String(50), nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
