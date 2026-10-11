// 前后端 API 契约类型定义（与 docs/03-api-契约.md 对齐，字段统一 camelCase）

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// ---------- 认证 ----------
export interface LoginRequest {
  username: string;
  password: string;
  tenantCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
  permissions: string[];
}

// ---------- 租户 ----------
export type TenantStatus = "active" | "disabled";
export interface Tenant {
  id: string;
  name: string;
  code: string;
  status: TenantStatus;
  plan: string;
  maxUsers: number;
  contactName?: string;
  contactEmail?: string;
  createdAt: string;
}

// ---------- 用户 / 角色 / 权限 ----------
export type UserStatus = "active" | "disabled";
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  roles: Role[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  builtIn?: boolean;
}

export interface Permission {
  code: string;
  name: string;
  group: string;
}

// ---------- 栏目 ----------
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  description?: string;
  children?: Category[];
}

// ---------- 内容 / 多语言 / 版本 / 审核 ----------
export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export interface ContentTranslation {
  locale: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Content {
  id: string;
  categoryId: string;
  categoryName?: string;
  tags: string[];
  authorId: string;
  authorName?: string;
  status: ContentStatus;
  version: number;
  translations: ContentTranslation[];
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  body: string;
  summary: string;
  authorName?: string;
  changeNote?: string;
  createdAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";
export interface Review {
  id: string;
  contentId: string;
  contentTitle: string;
  submitterName?: string;
  status: ReviewStatus;
  comment?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
}

// ---------- 媒体 / 标签 / 日志 ----------
export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  contentCount?: number;
}

export interface OperationLog {
  id: string;
  userName: string;
  action: string;
  module: string;
  target: string;
  ip?: string;
  detail?: string;
  createdAt: string;
}

// ---------- Dashboard ----------
export interface TrendPoint {
  date: string;
  count: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalContents: number;
  publishedContents: number;
  pendingReviews: number;
  totalUsers: number;
  totalMedia: number;
  trend: TrendPoint[];
  categoryDistribution: CategoryDistribution[];
  recentLogs: OperationLog[];
}

// ---------- 权限码常量 ----------
export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard:read",
  TENANT_MANAGE: "tenant:manage",
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  CATEGORY_MANAGE: "category:manage",
  CONTENT_READ: "content:read",
  CONTENT_WRITE: "content:write",
  CONTENT_PUBLISH: "content:publish",
  WORKFLOW_REVIEW: "workflow:review",
  MEDIA_MANAGE: "media:manage",
  TAG_MANAGE: "tag:manage",
  LOG_READ: "log:read",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const LOCALES = [
  { code: "zh-CN", label: "简体中文" },
  { code: "en-US", label: "English" },
];
