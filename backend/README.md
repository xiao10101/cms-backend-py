# CMS 后端（FastAPI 自研）

技术栈：**FastAPI + Pydantic + SQLAlchemy(asyncio) + PostgreSQL + Redis + Celery**

> 设计文档见 [`../docs`](../docs)，初始化与依赖清单见 [`../docs/05-环境搭建与迁移指南.md`](../docs/05-环境搭建与迁移指南.md)。


## 迁移
uv run alembic revision --autogenerate -m "add tenant deleted_at"
uv run alembic upgrade head

- column "xxx" of relation ... does not exist =  没执行 upgrade
- API 明明改了逻辑却行为照旧 = 没重启
- 响应里新字段是 null / ValidationError = schema 没同步