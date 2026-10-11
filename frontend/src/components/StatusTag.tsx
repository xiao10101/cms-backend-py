import { Badge } from "@/components/ui/Badge";
import type { ContentStatus, ReviewStatus, TenantStatus, UserStatus } from "@/types";

type Color = "gray" | "blue" | "green" | "red" | "orange" | "purple";

const contentStatusMap: Record<ContentStatus, { label: string; color: Color }> = {
  draft: { label: "草稿", color: "gray" },
  pending: { label: "待审核", color: "orange" },
  approved: { label: "已审核", color: "blue" },
  published: { label: "已发布", color: "green" },
  rejected: { label: "已驳回", color: "red" },
  archived: { label: "已下线", color: "gray" },
};

const reviewStatusMap: Record<ReviewStatus, { label: string; color: Color }> = {
  pending: { label: "待审核", color: "orange" },
  approved: { label: "已通过", color: "green" },
  rejected: { label: "已驳回", color: "red" },
};

const tenantStatusMap: Record<TenantStatus, { label: string; color: Color }> = {
  active: { label: "启用", color: "green" },
  disabled: { label: "停用", color: "gray" },
};

const userStatusMap: Record<UserStatus, { label: string; color: Color }> = {
  active: { label: "正常", color: "green" },
  disabled: { label: "禁用", color: "gray" },
};

export function ContentStatusTag({ status }: { status: ContentStatus }) {
  const m = contentStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function ReviewStatusTag({ status }: { status: ReviewStatus }) {
  const m = reviewStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function TenantStatusTag({ status }: { status: TenantStatus }) {
  const m = tenantStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function UserStatusTag({ status }: { status: UserStatus }) {
  const m = userStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}
