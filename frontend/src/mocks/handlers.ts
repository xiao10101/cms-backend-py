import { http, HttpResponse } from "msw";
import {
  categories,
  categoryDistribution,
  contents,
  logs,
  medias,
  permissions,
  reviews,
  roles,
  tags,
  tenants,
  trend,
  users,
  versions,
} from "./data";
import type { Content, LoginRequest } from "@/types";

const ok = (data: unknown) => HttpResponse.json({ code: 0, message: "ok", data });
const fail = (message: string, status = 400) =>
  HttpResponse.json({ code: status, message, data: null }, { status });

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

function query(request: Request) {
  const s = new URL(request.url).searchParams;
  return {
    page: Number(s.get("page") || 1),
    pageSize: Number(s.get("pageSize") || 10),
    keyword: s.get("keyword") || "",
    status: s.get("status"),
    categoryId: s.get("categoryId"),
    module: s.get("module"),
  };
}

export const handlers = [
  // ---------- 认证 ----------
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    if (body.username === "admin" && body.password === "admin123") {
      const tenant = tenants.find((t) => t.code === body.tenantCode) || tenants[0];
      return ok({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: users[0],
        tenant,
        permissions: ["*"],
      });
    }
    return fail("用户名或密码错误", 401);
  }),
  http.get("/api/auth/profile", () => ok(users[0])),
  http.post("/api/auth/logout", () => ok(null)),

  // ---------- 工作台 ----------
  http.get("/api/dashboard/stats", () =>
    ok({
      totalContents: 128,
      publishedContents: 86,
      pendingReviews: 5,
      totalUsers: users.length,
      totalMedia: medias.length,
      trend,
      categoryDistribution,
      recentLogs: logs.slice(0, 6),
    })
  ),

  // ---------- 租户 ----------
  http.get("/api/tenants", ({ request }) => {
    const { page, pageSize, keyword } = query(request);
    const filtered = keyword ? tenants.filter((t) => t.name.includes(keyword)) : tenants;
    return ok(paginate(filtered, page, pageSize));
  }),
  http.get("/api/tenants/all", () => ok(tenants)),
  http.post("/api/tenants", async ({ request }) => {
    const body = (await request.json()) as Partial<typeof tenants[number]>;
    const t = { id: `t-${Date.now()}`, createdAt: "2026-10-04 10:00:00", status: "active" as const, plan: "基础版", maxUsers: 20, ...body } as typeof tenants[number];
    tenants.unshift(t);
    return ok(t);
  }),
  http.patch("/api/tenants/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<typeof tenants[number]>;
    const t = tenants.find((x) => x.id === params.id);
    if (t) Object.assign(t, body);
    return ok(t);
  }),
  http.delete("/api/tenants/:id", ({ params }) => {
    const i = tenants.findIndex((x) => x.id === params.id);
    if (i > -1) tenants.splice(i, 1);
    return ok(null);
  }),

  // ---------- 用户 / 角色 / 权限 ----------
  http.get("/api/users", ({ request }) => {
    const { page, pageSize, keyword } = query(request);
    const filtered = keyword ? users.filter((u) => u.name.includes(keyword) || u.username.includes(keyword)) : users;
    return ok(paginate(filtered, page, pageSize));
  }),
  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as Partial<typeof users[number]>;
    const u = { id: `u-${Date.now()}`, status: "active", roles: [], createdAt: "2026-10-04 10:00:00", ...body } as typeof users[number];
    users.push(u);
    return ok(u);
  }),
  http.patch("/api/users/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<typeof users[number]>;
    const u = users.find((x) => x.id === params.id);
    if (u) Object.assign(u, body);
    return ok(u);
  }),
  http.delete("/api/users/:id", ({ params }) => {
    const i = users.findIndex((x) => x.id === params.id);
    if (i > -1) users.splice(i, 1);
    return ok(null);
  }),
  http.get("/api/roles", () => ok(roles)),
  http.post("/api/roles", async ({ request }) => {
    const body = (await request.json()) as Partial<typeof roles[number]>;
    const r = { id: `r-${Date.now()}`, ...body } as typeof roles[number];
    roles.push(r);
    return ok(r);
  }),
  http.patch("/api/roles/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<typeof roles[number]>;
    const r = roles.find((x) => x.id === params.id);
    if (r) Object.assign(r, body);
    return ok(r);
  }),
  http.delete("/api/roles/:id", ({ params }) => {
    const i = roles.findIndex((x) => x.id === params.id);
    if (i > -1) roles.splice(i, 1);
    return ok(null);
  }),
  http.get("/api/permissions", () => ok(permissions)),

  // ---------- 栏目 ----------
  http.get("/api/categories/tree", () => ok(categories)),
  http.post("/api/categories", async ({ request }) => {
    const body = (await request.json()) as Partial<typeof categories[number]>;
    const c = { id: `c-${Date.now()}`, order: 99, ...body } as typeof categories[number];
    categories.push(c);
    return ok(c);
  }),
  http.patch("/api/categories/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<typeof categories[number]>;
    const c = categories.find((x) => x.id === params.id);
    if (c) Object.assign(c, body);
    return ok(c);
  }),
  http.delete("/api/categories/:id", ({ params }) => {
    const i = categories.findIndex((x) => x.id === params.id);
    if (i > -1) categories.splice(i, 1);
    return ok(null);
  }),
  http.patch("/api/categories/reorder", () => ok(null)),

  // ---------- 内容 ----------
  http.get("/api/contents", ({ request }) => {
    const { page, pageSize, keyword, status, categoryId } = query(request);
    let filtered = contents.filter((c) => {
      const kw = keyword && c.translations.some((t) => t.title.includes(keyword));
      return (!keyword || kw) && (!status || c.status === status) && (!categoryId || c.categoryId === categoryId);
    });
    return ok(paginate(filtered, page, pageSize));
  }),
  http.get("/api/contents/:id", ({ params }) => ok(contents.find((c) => c.id === params.id))),
  http.post("/api/contents", async ({ request }) => {
    const body = (await request.json()) as Partial<Content>;
    const c = { id: `ct-${Date.now()}`, status: "draft", version: 1, createdAt: "2026-10-04 10:00:00", updatedAt: "2026-10-04 10:00:00", ...body } as Content;
    contents.unshift(c);
    return ok(c);
  }),
  http.patch("/api/contents/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Content>;
    const c = contents.find((x) => x.id === params.id);
    if (c) Object.assign(c, body);
    return ok(c);
  }),
  http.delete("/api/contents/:id", ({ params }) => {
    const i = contents.findIndex((x) => x.id === params.id);
    if (i > -1) contents.splice(i, 1);
    return ok(null);
  }),
  http.post("/api/contents/:id/submit", ({ params }) => {
    const c = contents.find((x) => x.id === params.id);
    if (c) c.status = "pending";
    return ok(c);
  }),
  http.post("/api/contents/:id/publish", ({ params }) => {
    const c = contents.find((x) => x.id === params.id);
    if (c) {
      c.status = "published";
      c.publishedAt = "2026-10-04 10:00:00";
    }
    return ok(c);
  }),
  http.post("/api/contents/:id/schedule", async ({ request, params }) => {
    const { scheduledAt } = (await request.json()) as { scheduledAt: string };
    const c = contents.find((x) => x.id === params.id);
    if (c) c.scheduledAt = scheduledAt;
    return ok(c);
  }),
  http.post("/api/contents/:id/archive", ({ params }) => {
    const c = contents.find((x) => x.id === params.id);
    if (c) c.status = "archived";
    return ok(c);
  }),
  http.get("/api/contents/:id/versions", ({ params }) =>
    ok(versions.filter((v) => v.contentId === params.id))
  ),
  http.post("/api/contents/:id/versions/:versionId/rollback", ({ params }) =>
    ok(contents.find((c) => c.id === params.id))
  ),

  // ---------- 审核 ----------
  http.get("/api/reviews", ({ request }) => {
    const { page, pageSize, status } = query(request);
    const filtered = status ? reviews.filter((r) => r.status === status) : reviews;
    return ok(paginate(filtered, page, pageSize));
  }),
  http.post("/api/reviews/:id/approve", async ({ request, params }) => {
    const { comment } = (await request.json()) as { comment?: string };
    const r = reviews.find((x) => x.id === params.id);
    if (r) {
      r.status = "approved";
      r.comment = comment;
      r.reviewedByName = "孙莉";
      r.reviewedAt = "2026-10-04 10:00:00";
    }
    return ok(r);
  }),
  http.post("/api/reviews/:id/reject", async ({ request, params }) => {
    const { comment } = (await request.json()) as { comment?: string };
    const r = reviews.find((x) => x.id === params.id);
    if (r) {
      r.status = "rejected";
      r.comment = comment;
      r.reviewedByName = "孙莉";
      r.reviewedAt = "2026-10-04 10:00:00";
    }
    return ok(r);
  }),

  // ---------- 媒体 / 标签 / 日志 ----------
  http.get("/api/media", ({ request }) => {
    const { page, pageSize, keyword } = query(request);
    const filtered = keyword ? medias.filter((m) => m.filename.includes(keyword)) : medias;
    return ok(paginate(filtered, page, pageSize));
  }),
  http.post("/api/media/upload", async ({ request }) => {
    const form = await request.formData();
    const file = form.get("file") as File;
    const m = {
      id: `m-${Date.now()}`,
      filename: file?.name || "upload.png",
      url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600",
      mimeType: file?.type || "image/png",
      size: file?.size || 1024,
      createdAt: "2026-10-04 10:00:00",
    };
    medias.unshift(m);
    return ok(m);
  }),
  http.delete("/api/media/:id", ({ params }) => {
    const i = medias.findIndex((x) => x.id === params.id);
    if (i > -1) medias.splice(i, 1);
    return ok(null);
  }),
  http.get("/api/tags", () => ok(tags)),
  http.post("/api/tags", async ({ request }) => {
    const body = (await request.json()) as Partial<typeof tags[number]>;
    const t = { id: `tag-${Date.now()}`, color: "#366EF4", ...body } as typeof tags[number];
    tags.push(t);
    return ok(t);
  }),
  http.patch("/api/tags/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<typeof tags[number]>;
    const t = tags.find((x) => x.id === params.id);
    if (t) Object.assign(t, body);
    return ok(t);
  }),
  http.delete("/api/tags/:id", ({ params }) => {
    const i = tags.findIndex((x) => x.id === params.id);
    if (i > -1) tags.splice(i, 1);
    return ok(null);
  }),
  http.get("/api/logs", ({ request }) => {
    const { page, pageSize, module } = query(request);
    const filtered = module ? logs.filter((l) => l.module === module) : logs;
    return ok(paginate(filtered, page, pageSize));
  }),
];
