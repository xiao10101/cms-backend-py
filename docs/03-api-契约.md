# 03 · API 契约

> 前端 `frontend/src/api` 与 `frontend/src/types` 已严格按本契约实现。后端实现时必须保持字段名（camelCase）与结构一致。

## 1. 通用约定

- 基础路径：`/api`
- 认证：除标注 `公开` 外，均需请求头 `Authorization: Bearer <accessToken>`
- 租户上下文：请求头 `X-Tenant-Id: <tenantId>`（登录后由前端自动注入）
- 统一响应包装：

```json
{ "code": 0, "message": "ok", "data": { } }
```

- 分页请求：`?page=1&pageSize=10`；分页响应：

```json
{ "items": [], "total": 100, "page": 1, "pageSize": 10 }
```

### 错误码

| code | 含义 |
| --- | --- |
| 0 / 200 | 成功 |
| 400 | 参数校验失败 |
| 401 | 未认证 / token 失效 |
| 403 | 无权限 / 跨租户越权 |
| 404 | 资源不存在 |
| 409 | 冲突（版本号冲突、唯一约束等） |
| 429 | 触发限流 |
| 500 | 服务器内部错误 |

### Pydantic 序列化约定

- 后端 SQLAlchemy 模型用 `snake_case`，API 响应统一输出 `camelCase`（与前端对齐）。
- Pydantic v2 通过 `alias_generator=to_camel` 或字段 `alias` 自动转换。
- 示例：模型 `contact_name` → API `contactName`，`max_users` → `maxUsers`，`scheduled_at` → `scheduledAt`。

```python
# 统一 camelCase 输出的 BaseModel 基类
from pydantic import BaseModel
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = {"alias_generator": to_camel, "populate_by_name": True}
```

## 2. 认证模块

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/auth/login` | 公开 | 登录，返回 tokens + 用户 + 租户 + 权限 |
| POST | `/auth/refresh` | 公开 | 刷新 accessToken（refreshToken 轮换） |
| GET | `/auth/profile` | 登录 | 当前用户信息 |
| POST | `/auth/logout` | 登录 | 登出，吊销 refreshToken |

`POST /auth/login` 请求体：
```json
{ "username": "admin", "password": "admin123", "tenantCode": "yunshan" }
```
响应 `data`：
```json
{
  "accessToken": "xxx",
  "refreshToken": "xxx",
  "user": { "id": "u-1", "username": "admin", "name": "系统管理员", "email": "", "status": "active", "roles": [], "lastLoginAt": "", "createdAt": "" },
  "tenant": { "id": "t-1001", "name": "云杉科技集团", "code": "yunshan", "status": "active", "plan": "企业版", "maxUsers": 200 },
  "permissions": ["*"]
}
```

## 3. 租户模块

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/tenants` | `tenant:manage` | 分页列表（`?keyword=`） |
| GET | `/tenants/all` | 公开（登录页选租户） | 全量 |
| POST | `/tenants` | `tenant:manage` | 新增 |
| PATCH | `/tenants/:id` | `tenant:manage` | 更新 |
| DELETE | `/tenants/:id` | `tenant:manage` | 删除 |

## 4. 成员 / 角色 / 权限

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/users` | `user:manage` | 分页成员列表（`?keyword=`） |
| POST | `/users` | `user:manage` | 新增成员 |
| PATCH | `/users/:id` | `user:manage` | 更新成员（含角色分配） |
| DELETE | `/users/:id` | `user:manage` | 删除成员 |
| GET | `/roles` | `role:manage` | 角色列表 |
| POST | `/roles` | `role:manage` | 新增角色 |
| PATCH | `/roles/:id` | `role:manage` | 更新角色（含权限） |
| DELETE | `/roles/:id` | `role:manage` | 删除角色 |
| GET | `/permissions` | 登录 | 权限码清单（用于勾选） |

`GET /permissions` 响应（权限码分组）：
```json
[ { "code": "content:read", "name": "内容查看", "group": "内容管理" } ]
```

## 5. 栏目模块

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/categories/tree` | `category:manage` | 树形栏目 |
| POST | `/categories` | `category:manage` | 新增 |
| PATCH | `/categories/:id` | `category:manage` | 更新 |
| DELETE | `/categories/:id` | `category:manage` | 删除 |
| PATCH | `/categories/reorder` | `category:manage` | 拖拽排序 |

`PATCH /categories/reorder` 请求体：
```json
{ "items": [ { "id": "c-1", "order": 1, "parentId": null } ] }
```

## 6. 内容模块

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/contents` | `content:read` | 分页（`?keyword=&status=&categoryId=`） |
| GET | `/contents/:id` | `content:read` | 详情（含 translations） |
| POST | `/contents` | `content:write` | 新建 |
| PATCH | `/contents/:id` | `content:write` | 更新 |
| DELETE | `/contents/:id` | `content:write` | 删除 |
| POST | `/contents/:id/submit` | `content:write` | 提交审核 |
| POST | `/contents/:id/publish` | `content:publish` | 立即发布 |
| POST | `/contents/:id/schedule` | `content:publish` | 定时发布 |
| POST | `/contents/:id/archive` | `content:publish` | 下线 |
| GET | `/contents/:id/versions` | `content:read` | 版本历史 |
| POST | `/contents/:id/versions/:versionId/rollback` | `content:write` | 回滚到版本 |

内容对象结构：
```json
{
  "id": "ct-1",
  "categoryId": "c-2",
  "tags": ["前端", "架构"],
  "authorId": "u-2",
  "authorName": "张伟",
  "status": "published",
  "version": 3,
  "translations": [
    { "locale": "zh-CN", "title": "标题", "slug": "slug", "summary": "", "body": "<h2>...</h2>", "seoTitle": "", "seoDescription": "" }
  ],
  "publishedAt": "2026-09-28 10:00:00",
  "scheduledAt": null,
  "createdAt": "", "updatedAt": ""
}
```

`POST /contents/:id/schedule` 请求体：`{ "scheduledAt": "2026-10-05 08:00:00" }`

## 7. 审核模块

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/reviews` | `workflow:review` | 分页（`?status=`） |
| POST | `/reviews/:id/approve` | `workflow:review` | 通过（`{ "comment": "" }`） |
| POST | `/reviews/:id/reject` | `workflow:review` | 驳回（`{ "comment": "" }`） |

## 8. 媒体 / 标签 / 日志

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/media` | `media:manage` | 分页（`?keyword=`） |
| POST | `/media/upload` | `media:manage` | 上传（multipart，字段 `file`） |
| DELETE | `/media/:id` | `media:manage` | 删除 |
| GET | `/tags` | `tag:manage` | 标签列表 |
| POST | `/tags` | `tag:manage` | 新增 |
| PATCH | `/tags/:id` | `tag:manage` | 更新 |
| DELETE | `/tags/:id` | `tag:manage` | 删除 |
| GET | `/logs` | `log:read` | 操作日志（`?module=`） |

## 9. 工作台

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/dashboard/stats` | `dashboard:read` | 统计聚合 |

`data`：
```json
{
  "totalContents": 128, "publishedContents": 86, "pendingReviews": 5,
  "totalUsers": 5, "totalMedia": 6,
  "trend": [ { "date": "09-28", "count": 12 } ],
  "categoryDistribution": [ { "name": "新闻中心", "value": 42 } ],
  "recentLogs": [ { "id": "", "userName": "", "action": "", "module": "", "target": "", "createdAt": "" } ]
}
```

## 10. 权限码清单（RBAC）

| code | 含义 |
| --- | --- |
| `dashboard:read` | 工作台查看 |
| `tenant:manage` | 租户管理 |
| `user:manage` | 成员管理 |
| `role:manage` | 角色权限 |
| `category:manage` | 栏目管理 |
| `content:read` / `content:write` / `content:publish` | 内容查看/编辑/发布 |
| `workflow:review` | 内容审核 |
| `media:manage` | 媒体管理 |
| `tag:manage` | 标签管理 |
| `log:read` | 日志查看 |

> 超级管理员 `permissions: ["*"]` 通配所有权限。守卫层 `PermissionsGuard` 校验 `*` 或精确匹配。
