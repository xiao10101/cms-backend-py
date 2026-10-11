# 多租户多语言 CMS 后台管理系统

面向企业内容团队的多租户、多语言内容管理平台。

## 目录结构

```
admin/
├── frontend/          # 前端（React 18 + Vite + TS，完整实现）
├── backend/           # 后端（FastAPI + SQLAlchemy + Celery，自研）
├── docs/              # 后端设计文档（施工图）
└── docker-compose.yml # PostgreSQL / Redis / RabbitMQ
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 18 + Vite 5 + TypeScript + Tailwind CSS |
| 后端 | FastAPI + Pydantic + SQLAlchemy(asyncio) + PostgreSQL |
| 异步任务 | Celery + Redis |
| 缓存 | Redis |

## 快速开始

```bash
# 1. 启动基础设施
docker compose up -d

# 2. 前端（默认带 MSW mock，可独立运行）
cd frontend && pnpm install && pnpm dev

# 3. 后端（见 docs/05）
cd backend && ...
```

## 设计文档

详见 [`docs/`](./docs)，含架构总览、数据模型、API 契约、技术难点清单与分阶段任务清单。
