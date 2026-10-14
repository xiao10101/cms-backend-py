# PROGRESS · 开发进度追踪

> 本文件是项目进度的**唯一事实来源**（Single Source of Truth）。
> 约定：每个子任务经导师 review 通过后，立即更新对应条目与仪表盘；用户可随时自行补充「踩坑与经验沉淀」。
> 阶段验收标准见 `docs/06-后端任务清单.md`，节奏与子任务拆解见 `docs/08-开发计划与导师引导方案.md`。

---

## 0. 使用说明

| 状态 | 含义 |
| --- | --- |
| `未开始` | 尚未启动 |
| `进行中` | 已启动，代码编写或调试中 |
| `待 review` | 代码已完成，等待导师 review |
| `已完成` | Review 通过 + 完成信号（自查清单）全绿 |
| `阻塞` | 被外部因素卡住（需在备注写明原因与解法） |
| `跳过` | 经确认不做（需写明理由） |

**更新时机**：
1. 子任务完成 → 状态改 `已完成`，填写完成日期、产出/证据（如 curl 输出、测试结果）
2. 遇阻 → 状态改 `阻塞`，备注写明现象与已尝试的思路
3. 阶段收尾 → 前端联调 + 对照 docs/06 验收清单，全部通过后阶段状态改 `已完成`，方可进入下一阶段
4. 每次更新同步追加「更新日志」一行

---

## 1. 项目仪表盘

| 项目 | 值 |
| --- | --- |
| 当前阶段 | 阶段 2 · 多租户 |
| 当前子任务 | — |
| 下一步动作 | T2.3a 查询越权验证（造第二个租户） |
| 阻塞项 | 无 |
| 总体进度 | 1 / 8 阶段；阶段 2 进行中 4 / 7 微任务 |
| 最近更新 | 2026-10-12 |

---

## 2. 阶段总览

| 阶段 | 主题 | 学习重点（摘自 docs/08） | 状态 | 完成日期 |
| --- | --- | --- | --- | --- |
| 1 | 地基 + 认证 | FastAPI 启动流程、pydantic-settings、async engine/session、Alembic、统一响应与异常、JWT 全链路、`Depends` 体系 | 已完成 | 2026-10-06 |
| 2 | 多租户 | 请求上下文提取、`with_loader_criteria` 全局过滤、update/delete 越权防护 | 进行中 | — |
| 3 | RBAC | 依赖工厂 `require_permission()`、权限码常量收敛、权限集下发 | 未开始 | — |
| 4 | 内容主线 | 自引用树、翻译表 upsert、`selectinload` 防 N+1、软删除、组合索引 | 未开始 | — |
| 5 | 版本管理 | 保存即快照、回滚 = 快照写回 + 版本递增、事务一致性 | 未开始 | — |
| 6 | 审核发布 | 显式状态机、乐观锁 `rowcount` 判定、`apply_async(eta=...)` + 分布式锁 | 未开始 | — |
| 7 | 工程化收尾 | 流式上传与路径安全、审计日志、聚合统计、pytest-asyncio + httpx、traceId 贯穿 | 未开始 | — |
| 8 | 异步任务 | 多队列、重试与幂等、beat 调度、进度写缓存供轮询 | 未开始 | — |

> 规则：后续阶段的子任务在**临近时**再细拆（避免过早固化细节），拆解后补充到第 3 节对应小节。

---

## 3. 阶段明细

### 阶段 1 · 地基 + 认证

| # | 微任务 | 完成信号（验收口径） | 状态 | 完成日期 | 产出 / 证据 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| T1.1a | 基础设施就绪 | 两服务 healthy；容器内 `psql -c '\l'` 可连库 | 已完成 | 2026-10-05 | psql `\l` 列出 4 库；其余信号口头确认全绿 | rabbitmq 服务/孤儿容器/数据卷已清理 |
| T1.1b | uv 初始化与依赖 | `uv run python -V` 为 3.13.x；三件套文件生成 | 已完成 | 2026-10-06 | 三件套 + 全量依赖补装（uv tree 核对） | 返工已闭环：依赖缺口于 T1.3a 前补齐验证 |
| T1.1c | 包骨架与 .gitignore | 目录树成型；`.venv/`、`.env` 被忽略 | 已完成 | 2026-10-05 | 口头确认 | 思考题由导师补讲 |
| T1.1d | 最小应用与 /health | `uv run uvicorn` 启动；`/health` ok；`/docs` 可见 | 已完成 | 2026-10-05 | app/main.py 7 行；review 通过 | async def 执行模型已讲透；运行结果口头确认 |
| T1.2a | Settings 类与 .env | REPL 实例化成功；密钥不入 git | 已完成 | 2026-10-05 | config.py 8 字段 + .env/.env.example | 经三轮 review：概念纠偏 + fail-fast 原则 + PEP 8 |
| T1.2b | settings 接入应用 | 改 `.env` 字段 → 应用行为可观察变化 | 已完成 | 2026-10-05 | main.py 接入 lru_cache 单例；DEBUG 开关驱动 /docs | fail-fast 标尺已落实；遗留微调：import os、冒号空格 |
| T1.3a | db/base.py | 可 import，不依赖 PG | 已完成 | 2026-10-05 | Base + naming_convention + TimestampMixin | T1.1b 返工（补装依赖）在此步验证通过 |
| T1.3b | engine 与 session 工厂 | REPL 可构建（不实际连库） | 已完成 | 2026-10-06 | engine.url 验证通过（密码自动打码） | 分层修正 + lazy 校验课（验收时漏更，本次审计补记） |
| T1.3c | 模型：租户与用户域 | import 成功，字段核对无误 | 已完成 | 2026-10-05 | tenants/users/refresh_tokens 三表 + 复合唯一约束 | 经三轮 review：求值时机 + 单元素元组 + 表名复数 |
| T1.3d | 模型：RBAC 域 | import 成功，字段核对无误 | 已完成 | 2026-10-05 | roles + user_roles；association 独立文件破环 | configure_mappers 纳入完成信号；回补 User.roles |
| T1.3e | 模型：内容域与支撑域 | docs/02 全部 14 张表 import 成功 + `configure_mappers()` ok | 已完成 | 2026-10-05 | 14 张表全注册；自引用/多外键/双层级联全部就位 | review 抓出 deleted_at/reviewed_at 语义 bug（完成信号抓不住的） |
| T1.3f | Alembic 初始化与首迁 | `alembic upgrade head` 成功 | 已完成 | 2026-10-05 | 15 张表（14 业务 + alembic_version）；迁移脚本导师审阅合格 | 思考题改为抽查制（用户欠账，答案已存档） |
| T1.3g | 首迁验证与往返 | 往返成功，结构无差异 | 已完成 | 2026-10-05 | downgrade → upgrade 往返通过 | T1.3 数据层组收官（7/7） |
| T1.4a | CamelModel 基类 | REPL dump 出 camelCase | 已完成 | 2026-10-05 | schemas/base.py 6 行 | to_camel 复用 pydantic 内置轮子 |
| T1.4b | ApiResponse 包装 | 临时路由返回 `{ code, message, data }` | 已完成 | 2026-10-05 | 泛型 ApiResponse[T] + ok/fail 工厂；curl 验证通过 | classmethod/契约对齐/async 纪律三轮落实 |
| T1.4c | 全局异常处理器 | 校验失败/404/401 均为统一结构 | 已完成 | 2026-10-05 | 三类 handler + 统一 400/500 结构；三条 curl 全绿 | 经三轮返工（概念纠偏 + 注册覆盖 bug）；register 收口模式确立 |
| T1.5a | 密码哈希 | REPL：正确密码 True / 错误密码 False | 已完成 | 2026-10-05 | security.py hash/verify 双函数 | salt 概念亲证（same: False）；pwdlib 门面隔离 |
| T1.5b | JWT 签发与校验 | encode→decode 往返；篡改 token 抛 InvalidToken | 已完成 | 2026-10-06 | 双 token 签发 + 篡改检测验证通过 | type claim 概念补课；extra 未用参数待删 |
| T1.6a | get_db 依赖 | 临时路由注入 db 正常响应 | 已完成 | 2026-10-06 | deps.py get_db + 临时路由验证 AsyncSession | yield 依赖的 setup/teardown 语义讲透 |
| T1.7c | 种子数据脚本 | psql 可见 tenants/users 种子行，密码 argon2 hash | 已完成 | 2026-10-06 | seed.py 幂等写入，psql 验证两表 | 先查再插 + flush 拿 id 两个知识点落地 |
| T1.7a | 登录服务 | curl 登录返回双 token；错误密码 401 | 已完成 | 2026-10-06 | authenticate 四元组返回；curl 双绿 | 经三轮 review：and 误用/防枚举/落库缺失 |
| T1.7b | POST /auth/login | 前端登录页登录成功跳工作台 | 已完成 | 2026-10-06 | 后端 curl 双绿；refresh 落库 psql 确认；前端对接完成（baseURL /api/v1 + env 关 mock） | schema 白名单哲学首秀 |
| T1.6b | get_current_user | 不带/坏/refresh 冒充 401；有效 token 200 | 已完成 | 2026-10-06 | 四条 curl 全绿（代跑验证） | 异常翻译层/type 防线落地；404 vs 401 排障课 |
| T1.8a | refresh 轮换与吊销 | 同一旧 refresh 第二次使用返回 401 | 已完成 | 2026-10-06 | 三连验证：刷新成功/复用 401/新链正常 | jti 事故排查（JWT 确定性签发撞车）→ 已修复 |
| T1.8b | 登出 | 登出后该 refresh 不可再用 | 已完成 | 2026-10-06 | 四连验证：登出/失效/幂等×2 | 幂等语义落地；import 卫生课 |
| T1.9a | GET /auth/profile | 前端工作台显示正确用户信息 | 已完成 | 2026-10-06 | curl 三态验证 + 前端接入 | 附带 GET /tenants/all（公开，契约修正） |
| T1.8c | 无感刷新联调 | access 过期后操作无感继续 | 已完成 | 2026-10-06 | 1 分钟 token 联调：401→refresh→重放 200 | 前端 MainLayout 挂 profile（导师实现） |
| T1.9b | 阶段验收 | docs/06 阶段 1 三项验收全绿 | 已完成 | 2026-10-06 | 八项回归全绿（导师代跑）；浏览器 401 跳登录验证 | 阶段 1 完成（28/28） |

**阶段 1 收尾清单**（T1.9 时逐项勾选）：

- [x] 前端联调通过（`VITE_USE_MOCK=false`，登录 → 工作台全流程）
- [x] docs/06 阶段 1 验收清单逐项确认（三项全绿：登录跳转 / 无感刷新 / 401 拦截跳登录）
- [x] 无回归（八项完成信号复测通过）

### 阶段 2 · 多租户

| # | 微任务 | 完成信号（验收口径） | 状态 | 完成日期 | 产出 / 证据 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| T2.1a | 概念课 + 现状梳理 | 说清租户上下文要解决的问题；盘点表归属 | 已完成 | 2026-10-12 | 8/8 直连租户表识别精准；派生隔离（关联表/子表/tenants 自身）导师补讲 | 概念：直接隔离 vs 派生隔离 |
| T2.1b | 请求上下文容器 | REPL/脚本验证 ContextVar 协程隔离 | 已完成 | 2026-10-12 | set/get/reset 三段式 + gather 多协程各读各的；scratch.py 已删 | 两个踩坑：gather 忘 await（floating promise）/ run 收协程不收 Future |
| T2.2a | get_current_tenant_id 依赖 | 临时路由返回当前用户 tenant_id | 已完成 | 2026-10-12 | curl 双绿（无 token 401 / 有效 token 返回租户） | 经一轮 review：手动调用依赖 → 改 Depends 注入；删死分支（fail-fast） |
| T2.2b | TenantIdMixin + 全局过滤 | SQL 日志可见自动注入的 WHERE tenant_id | 已完成 | 2026-10-12 | 8 模型挂 mixin（autogenerate 空迁移验证）；session.py do_orm_execute 拦截器；SQL 日志确认 WHERE 注入 + 无上下文放行 | 关键决策：上下文 None 时放行（鸡生蛋问题），安全靠 T2.3 越权测试补偿；卫语句跳过 relationship/column load |
| T2.3a | 查询越权验证 | A 租户 token 查 B 租户数据 → 不可见 | 已完成 | 2026-10-12 | 种子扩至双租户；双 token 请求同接口各见 1 条、tenant_id 各归各（DB 实有 2 条用户） | 幂等种子 + 复合唯一约束知识点落地 |
| T2.3b | 写操作越权防护 | B 租户 token 改 A 租户数据 → 404/403 | 已完成 | 2026-10-12 | 临时 PATCH 路由四条 curl：本租户 200 ×2 / 跨租户 404 ×2 | 模式：tenant_id 进 WHERE + rowcount==0 → 404（隐藏资源存在性）；与阶段 6 乐观锁同源 |
| T2.4 | 租户 CRUD + 阶段验收 | 前端联调 + docs/06 验收清单全绿 | 进行中 | — | T2.4a GET /tenants 分页+搜索（Query 校验、Page[T] 泛型、双查询共享 WHERE）；T2.4b POST 新增（约束兜底+IntegrityError→409、refresh）；用户自主发现输入校验缺口→TenantCreateReq 上 Field/Literal 约束；管理路由补认证闸门（无 token 401） | 权限守卫 tenant:manage 留待阶段 3；契约偏差 X-Tenant-Id header → token 派生，收尾修 docs/03 |

### 阶段 3 · RBAC

> 临近时细拆。

### 阶段 4 · 内容主线

> 临近时细拆。

### 阶段 5 · 版本管理

> 临近时细拆。

### 阶段 6 · 审核发布

> 临近时细拆。

### 阶段 7 · 工程化收尾

> 临近时细拆。

### 阶段 8 · 异步任务

> 临近时细拆。

---

## 4. 踩坑与经验沉淀

> 每解决一个报错/纠偏，记一条：现象 → 原因 → 解法 → 收获。这是你复盘后端学习的核心资产，由你填写，导师可点评。

| 日期 | 关联任务 | 现象 | 原因 | 解法 | 收获（一句话） |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

---

## 5. 遗留问题与风险

> 未阻塞当前任务、但需要回头处理的事项（技术债、待确认决策等）。阻塞当前任务的写进仪表盘「阻塞项」。

| 登记日期 | 描述 | 影响范围 | 处理期限 | 状态 |
| --- | --- | --- | --- | --- |
| 2026-10-05 | #1 T1.1b 依赖不完整：pyproject.toml 仅声明 fastapi[standard]，sqlalchemy/pydantic-settings/alembic/asyncpg/pyjwt/pwdlib/python-multipart/celery/redis 及 dev 组全部缺失 | backend 全部后续任务 | T1.3b 开始前必须修复 | 已关闭（2026-10-05 补装并验证） |
| 2026-10-05 | #2 教训：T1.1b 原完成信号只验「文件存在」未验「依赖齐全」；docs/08 已补充 `uv tree` 核对步骤 | 流程 | — | 已改进 |
| 2026-10-05 | #3 索引覆盖计划：user_roles.role_id / content_tags.tag_id（关联表反向）及 reviews 等表的 tenant_id 无索引；PG 不为 FK 自动建索引 | 阶段 4 内容域 + T1.9 阶段验收 | T1.4 期间统一梳理 | 已登记 |
| 2026-10-05 | #4 requestId/traceId 需求（用户提出，公司实践背书）：阶段 7 实现时决策响应头 X-Request-Id vs body 字段（后者需改 docs/03 契约），并补日志系统 + contextvars 设计 | 阶段 7 工程化收尾 | 阶段 7 第一个待办 | 已登记 |
| 2026-10-13 | #5 阶段 2 已知安全缺口：/tenants 管理接口（POST/PATCH/DELETE/分页列表）仅认证未授权，任何登录用户可跨租户管理平台资源。设计上属授权缺失而非隔离缺失（tenants 为平台资源，不适用租户过滤）。阶段 3 `require_permission("tenant:manage")` 落地后关闭 | 阶段 3 | 阶段 3 第一个任务 | 已登记 |

---

## 6. 更新日志

| 日期 | 更新内容 |
| --- | --- |
| 2026-10-05 | 进度追踪体系建立；阶段 1 子任务 T1.1–T1.9 拆解入库（源自 docs/08）；T1.1 启动 |
| 2026-10-05 | 工具链决策：包管理从 venv+pip+requirements.txt 切换为 uv 项目模式；docs/08 T1.1 指令、自查清单同步更新 |
| 2026-10-05 | 应「小步慢走」要求，阶段 1 重拆为 28 个微任务（T1.1a–T1.9b）；docs/08 第 5/6 节与仪表盘同步更新，当前任务改为 T1.1a |
| 2026-10-05 | T1.1a 完成验收（基础设施就绪，rabbitmq 已清理）；进入 T1.1b |
| 2026-10-05 | T1.1b 完成验收（uv 项目三件套 + 依赖安装）；进入 T1.1c |
| 2026-10-05 | T1.1c 完成验收（包骨架 + .gitignore）；进入 T1.1d（首个代码微任务，开始正式 review 环节） |
| 2026-10-05 | T1.1d 完成验收（main.py review 通过，async def 执行模型校准）；T1.1 组收官，进入 T1.2a |
| 2026-10-05 | T1.2a 完成验收（Settings 类经三轮 review 通过）；进入 T1.2b |
| 2026-10-05 | T1.2b 完成验收（lru_cache 单例接入 main.py，DEBUG 开关驱动 /docs 验证通过）；进入 T1.3a |
| 2026-10-05 | T1.1b 返工完成（补装全部缺失依赖并验证）；T1.3a 完成验收（base.py 三块积木）；进入 T1.3b |
| 2026-10-05 | T1.3b 完成验收（engine/session 工厂，分层依赖修正）；T1.3c 完成验收（租户用户域三表，完成信号兜住元组语法错误）；进入 T1.3d |
| 2026-10-05 | T1.3d 完成验收（RBAC 域 + 关联表破环 + TYPE_CHECKING 模式）；发现 T1.3e 拆解遗漏四个支撑域模型并修订范围；进入 T1.3e |
| 2026-10-05 | T1.3e 完成验收（14 张表全注册，模型层完成）；进入 T1.3f（Alembic 初始化与首迁） |
| 2026-10-05 | T1.3f 完成验收（首迁成功，迁移脚本审阅合格，索引计划记遗留 #3）；进入 T1.3g（往返验证） |
| 2026-10-05 | T1.3g 完成验收（迁移往返通过）；T1.3 数据层组收官，进入 T1.4a（CamelModel 基类） |
| 2026-10-05 | T1.4a 完成验收（CamelModel 基类）；进入 T1.4b（ApiResponse 泛型包装） |
| 2026-10-05 | T1.4b 完成验收（泛型包装 + checklist 工作法确立）；进入 T1.4c（全局异常处理器） |
| 2026-10-05 | T1.4c 完成验收（三类 handler 统一错误结构）；T1.4 组收官，进入 T1.5a（密码哈希） |
| 2026-10-05 | T1.5a 完成验收（argon2 盐机制亲证）；进入 T1.5b（JWT 签发与校验） |
| 2026-10-06 | T1.5b 完成验收（双 token 签发/篡改检测，type claim 概念讲透）；T1.5 安全基元组收官，进入 T1.6a（get_db 依赖） |
| 2026-10-06 | T1.6a 完成验收（get_db 依赖通路）；进入 T1.6b（get_current_user，阶段 1 收官之战） |
| 2026-10-06 | 用户质疑执行顺序并被采纳：T1.7c 种子提前、T1.6b 后移（可观测性）；进入 T1.7c |
| 2026-10-06 | T1.7c 完成验收（种子数据就位）；进入 T1.7a（登录服务） |
| 2026-10-06 | T1.7a/T1.7b 完成验收（登录全链路，curl 双绿）；前端登录对接完成（baseURL /api/v1、关 mock、401 豁免）；进入 T1.6b |
| 2026-10-06 | T1.6b 完成验收（四条 curl 全绿，type 防线实战通过）；T1.6 依赖注入组收官，进入 T1.8a（refresh 轮换与吊销） |
| 2026-10-06 | T1.8a 完成验收（轮换/复用检测/jti 修复三连验证）；进入 T1.8b（登出） |
| 2026-10-06 | T1.8b 完成验收（登出四连验证）；T1.9a 提前、T1.8c 后移；进入 T1.9a |
| 2026-10-06 | T1.9a/T1.8c 完成验收（profile + 无感刷新联调）；T1.9b 阶段验收通过（八项回归 + 浏览器 401 跳登录）——**阶段 1 完成（28/28）**，进入阶段 2 |
| 2026-10-12 | 阶段 2 拆解为 7 个微任务（T2.1a–T2.4）；T2.1a/T2.1b 完成验收（概念梳理 + ContextVar 协程隔离）；进入 T2.2a |
| 2026-10-12 | T2.2a 完成验收（get_current_tenant_id 依赖，review 一轮通过）；进入 T2.2b |
| 2026-10-12 | T2.2b 完成验收（TenantIdMixin 8 表挂载 + with_loader_criteria 全局过滤，SQL 日志实证）——多租户核心机制落地；进入 T2.3a |
