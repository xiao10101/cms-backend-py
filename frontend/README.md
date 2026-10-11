# CMS 前端

多租户多语言 CMS 内容管理平台的前端，完整实现。

## 技术栈

- React 18 + Vite 5 + TypeScript 5
- 状态：Zustand + TanStack Query
- 请求：Axios + MSW（后端未就绪时用 mock 数据）
- 样式：Tailwind CSS + lucide-react + recharts

## 快速开始

```bash
pnpm install
pnpm dev       # 开发（默认带 MSW mock，可独立运行）
pnpm build     # 生产构建
```

## 联调后端

后端就绪后，将 `.env` 中 `VITE_USE_MOCK` 改为 `false`，请求经 `/api` 代理到后端（见 `vite.config.ts` 的 proxy）。

## 设计文档

后端设计文档见 [`../docs`](../docs)。
