import type {
  Category,
  Content,
  ContentVersion,
  Media,
  OperationLog,
  Permission,
  Review,
  Role,
  Tag,
  Tenant,
  User,
} from "@/types";

export const permissions: Permission[] = [
  { code: "dashboard:read", name: "工作台查看", group: "工作台" },
  { code: "tenant:manage", name: "租户管理", group: "系统管理" },
  { code: "user:manage", name: "成员管理", group: "系统管理" },
  { code: "role:manage", name: "角色权限", group: "系统管理" },
  { code: "category:manage", name: "栏目管理", group: "内容管理" },
  { code: "content:read", name: "内容查看", group: "内容管理" },
  { code: "content:write", name: "内容编辑", group: "内容管理" },
  { code: "content:publish", name: "内容发布", group: "内容管理" },
  { code: "workflow:review", name: "内容审核", group: "内容管理" },
  { code: "media:manage", name: "媒体管理", group: "内容管理" },
  { code: "tag:manage", name: "标签管理", group: "内容管理" },
  { code: "log:read", name: "日志查看", group: "系统管理" },
];

export const tenants: Tenant[] = [
  { id: "t-1001", name: "云杉科技集团", code: "yunshan", status: "active", plan: "企业版", maxUsers: 200, contactName: "林志远", contactEmail: "lin@yunshan.com", createdAt: "2025-03-12 09:20:00" },
  { id: "t-1002", name: "星河传媒", code: "xinghe", status: "active", plan: "专业版", maxUsers: 50, contactName: "陈思涵", contactEmail: "chen@xinghe.media", createdAt: "2025-06-08 14:35:00" },
  { id: "t-1003", name: "青蓝教育", code: "qinglan", status: "disabled", plan: "基础版", maxUsers: 20, contactName: "王可欣", contactEmail: "wang@qinglan.edu", createdAt: "2025-09-21 10:05:00" },
];

export const roles: Role[] = [
  { id: "r-1", name: "超级管理员", code: "super_admin", description: "拥有全部权限", permissions: ["*"], builtIn: true },
  { id: "r-2", name: "内容编辑", code: "editor", description: "负责内容创作与编辑", permissions: ["dashboard:read", "content:read", "content:write", "media:manage", "tag:manage"] },
  { id: "r-3", name: "审核专员", code: "reviewer", description: "负责内容审核流转", permissions: ["dashboard:read", "content:read", "workflow:review"] },
  { id: "r-4", name: "访客", code: "viewer", description: "只读查看", permissions: ["dashboard:read", "content:read"] },
];

export const users: User[] = [
  { id: "u-1", username: "admin", name: "系统管理员", email: "admin@cms.com", status: "active", roles: [roles[0]], lastLoginAt: "2026-10-04 09:12:33", createdAt: "2025-03-12 09:20:00" },
  { id: "u-2", username: "zhangwei", name: "张伟", email: "zhangwei@cms.com", status: "active", roles: [roles[1]], lastLoginAt: "2026-10-03 18:45:01", createdAt: "2025-04-02 11:00:00" },
  { id: "u-3", username: "liuyang", name: "刘洋", email: "liuyang@cms.com", status: "active", roles: [roles[1], roles[2]], lastLoginAt: "2026-10-04 08:30:12", createdAt: "2025-05-19 15:22:00" },
  { id: "u-4", username: "sunli", name: "孙莉", email: "sunli@cms.com", status: "active", roles: [roles[2]], lastLoginAt: "2026-10-02 16:08:44", createdAt: "2025-07-11 09:40:00" },
  { id: "u-5", username: "zhouqiang", name: "周强", email: "zhouqiang@cms.com", status: "disabled", roles: [roles[3]], lastLoginAt: "2026-08-15 10:20:00", createdAt: "2025-08-30 13:15:00" },
];

export const categories: Category[] = [
  { id: "c-1", name: "新闻中心", slug: "news", parentId: null, order: 1, description: "企业新闻与动态" },
  { id: "c-2", name: "产品动态", slug: "products", parentId: "c-1", order: 1 },
  { id: "c-3", name: "行业资讯", slug: "industry", parentId: "c-1", order: 2 },
  { id: "c-4", name: "公司公告", slug: "announcement", parentId: "c-1", order: 3 },
  { id: "c-5", name: "技术博客", slug: "tech", parentId: null, order: 2, description: "技术分享与工程实践" },
  { id: "c-6", name: "帮助文档", slug: "docs", parentId: null, order: 3 },
];

export const tags: Tag[] = [
  { id: "tag-1", name: "前端", slug: "frontend", color: "#366EF4", contentCount: 12 },
  { id: "tag-2", name: "后端", slug: "backend", color: "#00A870", contentCount: 9 },
  { id: "tag-3", name: "架构", slug: "architecture", color: "#ED7B2F", contentCount: 6 },
  { id: "tag-4", name: "NestJS", slug: "nestjs", color: "#E34D59", contentCount: 5 },
  { id: "tag-5", name: "数据库", slug: "database", color: "#8B5CF6", contentCount: 4 },
  { id: "tag-6", name: "DevOps", slug: "devops", color: "#0EA5E9", contentCount: 3 },
];

const zhBody = `<h2>背景</h2><p>随着业务规模的持续增长，内容团队对发布效率与协作体验提出了更高要求。传统的内容管理流程分散在多个工具之间，导致信息流转低效、版本难以追踪。</p><h3>核心挑战</h3><ul><li>多租户场景下的数据隔离与权限边界</li><li>多语言内容的同步维护与版本一致性</li><li>审核链路冗长，缺少可视化流转</li></ul><p>为此，我们构建了新一代多租户内容管理平台，以统一的工作流串联从创作到发布的完整生命周期。</p>`;

const enBody = `<h2>Background</h2><p>As the business continues to grow, content teams are demanding better publishing efficiency and collaboration. Legacy workflows were scattered across multiple tools, making information flow inefficient and versions hard to trace.</p><h3>Key Challenges</h3><ul><li>Data isolation and permission boundaries in multi-tenant scenarios</li><li>Multilingual content synchronization and version consistency</li><li>Lengthy review pipelines lacking visual tracking</li></ul><p>We therefore built a next-generation multi-tenant CMS that unifies the full lifecycle from creation to publishing.</p>`;

export const contents: Content[] = [
  {
    id: "ct-1", categoryId: "c-2", tags: ["前端", "架构"], authorId: "u-2", authorName: "张伟", status: "published", version: 3,
    translations: [
      { locale: "zh-CN", title: "新一代内容平台 2.0 正式发布", slug: "cms-2-0-release", summary: "重构后的多租户内容平台带来更流畅的编辑体验与更灵活的审核流。", body: zhBody },
      { locale: "en-US", title: "Next-gen CMS 2.0 Officially Released", slug: "cms-2-0-release", summary: "The rebuilt multi-tenant platform delivers smoother editing and a more flexible review flow.", body: enBody },
    ],
    publishedAt: "2026-09-28 10:00:00", createdAt: "2026-09-20 09:00:00", updatedAt: "2026-09-28 10:00:00",
  },
  {
    id: "ct-2", categoryId: "c-1", tags: ["后端", "数据库"], authorId: "u-3", authorName: "刘洋", status: "pending", version: 2,
    translations: [
      { locale: "zh-CN", title: "PostgreSQL 分区表在大内容量下的实践", slug: "pg-partitioning", summary: "面对亿级内容数据，我们如何利用分区表与索引优化查询。", body: zhBody },
    ],
    createdAt: "2026-10-01 14:20:00", updatedAt: "2026-10-02 11:30:00",
  },
  {
    id: "ct-3", categoryId: "c-3", tags: ["DevOps"], authorId: "u-2", authorName: "张伟", status: "draft", version: 1,
    translations: [
      { locale: "zh-CN", title: "Kubernetes 上运行 CMS 的最佳实践", slug: "cms-on-k8s", summary: "从资源配额到滚动发布，一篇讲透容器化部署。", body: zhBody },
    ],
    createdAt: "2026-10-03 16:45:00", updatedAt: "2026-10-03 16:45:00",
  },
  {
    id: "ct-4", categoryId: "c-5", tags: ["NestJS", "后端"], authorId: "u-3", authorName: "刘洋", status: "published", version: 5,
    translations: [
      { locale: "zh-CN", title: "NestJS 微服务拆分实战", slug: "nestjs-microservices", summary: "从单体到微服务的平滑演进路径与踩坑记录。", body: zhBody },
    ],
    publishedAt: "2026-08-15 09:00:00", createdAt: "2026-08-01 10:00:00", updatedAt: "2026-08-15 09:00:00",
  },
  {
    id: "ct-5", categoryId: "c-4", tags: ["架构"], authorId: "u-1", authorName: "系统管理员", status: "published", version: 2,
    translations: [
      { locale: "zh-CN", title: "关于平台国庆假期服务保障安排", slug: "holiday-notice", summary: "假期期间运维值班与发布窗口调整说明。", body: zhBody },
    ],
    publishedAt: "2026-09-26 09:00:00", createdAt: "2026-09-25 15:00:00", updatedAt: "2026-09-26 09:00:00",
  },
  {
    id: "ct-6", categoryId: "c-1", tags: ["前端"], authorId: "u-2", authorName: "张伟", status: "rejected", version: 1,
    translations: [
      { locale: "zh-CN", title: "前端性能优化清单（草稿）", slug: "fe-perf-checklist", summary: "首屏、交互、打包三个维度的优化清单。", body: zhBody },
    ],
    createdAt: "2026-09-30 10:00:00", updatedAt: "2026-10-01 09:00:00",
  },
];

export const versions: ContentVersion[] = [
  { id: "v-1", contentId: "ct-1", version: 3, title: "新一代内容平台 2.0 正式发布", summary: "发布版", body: zhBody, authorName: "张伟", changeNote: "补充英文翻译", createdAt: "2026-09-28 09:55:00" },
  { id: "v-2", contentId: "ct-1", version: 2, title: "新一代内容平台 2.0 正式发布", summary: "二审版", body: zhBody, authorName: "张伟", changeNote: "按审核意见修改措辞", createdAt: "2026-09-27 17:20:00" },
  { id: "v-3", contentId: "ct-1", version: 1, title: "新一代内容平台 2.0 正式发布", summary: "初稿", body: zhBody, authorName: "张伟", changeNote: "初稿提交", createdAt: "2026-09-20 09:00:00" },
  { id: "v-4", contentId: "ct-4", version: 5, title: "NestJS 微服务拆分实战", summary: "最新版", body: zhBody, authorName: "刘洋", changeNote: "修复示例代码", createdAt: "2026-08-15 08:50:00" },
  { id: "v-5", contentId: "ct-4", version: 4, title: "NestJS 微服务拆分实战", summary: "修订版", body: zhBody, authorName: "刘洋", changeNote: "补充部署章节", createdAt: "2026-08-14 16:00:00" },
];

export const reviews: Review[] = [
  { id: "rv-1", contentId: "ct-2", contentTitle: "PostgreSQL 分区表在大内容量下的实践", submitterName: "刘洋", status: "pending", createdAt: "2026-10-02 11:30:00" },
  { id: "rv-2", contentId: "ct-6", contentTitle: "前端性能优化清单（草稿）", submitterName: "张伟", status: "rejected", comment: "内容过于简略，请补充具体数据与案例后重新提交。", reviewedByName: "孙莉", reviewedAt: "2026-10-01 09:00:00", createdAt: "2026-09-30 10:00:00" },
  { id: "rv-3", contentId: "ct-1", contentTitle: "新一代内容平台 2.0 正式发布", submitterName: "张伟", status: "approved", comment: "内容详实，同意发布。", reviewedByName: "孙莉", reviewedAt: "2026-09-28 09:50:00", createdAt: "2026-09-27 17:20:00" },
];

export const medias: Media[] = [
  { id: "m-1", filename: "cover-cms-2.png", url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600", mimeType: "image/png", size: 204800, width: 1200, height: 800, createdAt: "2026-09-27 15:00:00" },
  { id: "m-2", filename: "banner-news.jpg", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600", mimeType: "image/jpeg", size: 358400, width: 1600, height: 900, createdAt: "2026-09-28 10:10:00" },
  { id: "m-3", filename: "tech-postgres.png", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600", mimeType: "image/png", size: 276480, width: 1200, height: 675, createdAt: "2026-10-01 14:00:00" },
  { id: "m-4", filename: "dashboard-preview.jpg", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", mimeType: "image/jpeg", size: 152000, width: 1200, height: 800, createdAt: "2026-09-30 11:00:00" },
  { id: "m-5", filename: "team-photo.jpg", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600", mimeType: "image/jpeg", size: 401408, width: 1600, height: 1067, createdAt: "2026-09-25 17:30:00" },
  { id: "m-6", filename: "architecture.svg", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600", mimeType: "image/svg+xml", size: 40960, createdAt: "2026-09-22 09:00:00" },
];

export const logs: OperationLog[] = [
  { id: "log-1", userName: "张伟", action: "更新内容", module: "内容管理", target: "新一代内容平台 2.0 正式发布", ip: "10.20.1.15", createdAt: "2026-10-04 08:45:12" },
  { id: "log-2", userName: "孙莉", action: "审核通过", module: "审核中心", target: "NestJS 微服务拆分实战", ip: "10.20.1.22", createdAt: "2026-10-03 19:30:40" },
  { id: "log-3", userName: "admin", action: "新增用户", module: "成员管理", target: "用户 孙莉", ip: "10.20.0.8", createdAt: "2026-10-03 16:12:05" },
  { id: "log-4", userName: "刘洋", action: "提交审核", module: "审核中心", target: "PostgreSQL 分区表在大内容量下的实践", ip: "10.20.1.30", createdAt: "2026-10-02 11:30:00" },
  { id: "log-5", userName: "admin", action: "配置角色", module: "角色权限", target: "角色 内容编辑", ip: "10.20.0.8", createdAt: "2026-10-02 09:00:22" },
  { id: "log-6", userName: "张伟", action: "上传媒体", module: "媒体资源", target: "tech-postgres.png", ip: "10.20.1.15", createdAt: "2026-10-01 14:00:00" },
  { id: "log-7", userName: "孙莉", action: "驳回内容", module: "审核中心", target: "前端性能优化清单（草稿）", ip: "10.20.1.22", createdAt: "2026-10-01 09:00:00" },
  { id: "log-8", userName: "admin", action: "调整租户套餐", module: "租户管理", target: "星河传媒", ip: "10.20.0.8", createdAt: "2026-09-30 15:40:18" },
];

export const trend = [
  { date: "09-28", count: 12 },
  { date: "09-29", count: 18 },
  { date: "09-30", count: 15 },
  { date: "10-01", count: 24 },
  { date: "10-02", count: 20 },
  { date: "10-03", count: 28 },
  { date: "10-04", count: 22 },
];

export const categoryDistribution = [
  { name: "新闻中心", value: 42 },
  { name: "产品动态", value: 35 },
  { name: "技术博客", value: 58 },
  { name: "帮助文档", value: 20 },
  { name: "公司公告", value: 12 },
];
