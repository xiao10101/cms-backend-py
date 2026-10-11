import http from "./http";
import type {
  Content,
  ContentStatus,
  ContentVersion,
  PageQuery,
  PageResult,
  Review,
} from "@/types";

export interface ContentQuery extends PageQuery {
  status?: ContentStatus;
  categoryId?: string;
  tag?: string;
}

export function getContents(params: ContentQuery): Promise<PageResult<Content>> {
  return http.get("/contents", { params });
}

export function getContent(id: string): Promise<Content> {
  return http.get(`/contents/${id}`);
}

export function createContent(data: Partial<Content>): Promise<Content> {
  return http.post("/contents", data);
}

export function updateContent(id: string, data: Partial<Content>): Promise<Content> {
  return http.patch(`/contents/${id}`, data);
}

export function deleteContent(id: string): Promise<void> {
  return http.delete(`/contents/${id}`);
}

export function submitReview(id: string): Promise<Content> {
  return http.post(`/contents/${id}/submit`);
}

export function publishContent(id: string): Promise<Content> {
  return http.post(`/contents/${id}/publish`);
}

export function scheduleContent(id: string, scheduledAt: string): Promise<Content> {
  return http.post(`/contents/${id}/schedule`, { scheduledAt });
}

export function archiveContent(id: string): Promise<Content> {
  return http.post(`/contents/${id}/archive`);
}

export function getVersions(contentId: string): Promise<ContentVersion[]> {
  return http.get(`/contents/${contentId}/versions`);
}

export function rollbackVersion(contentId: string, versionId: string): Promise<Content> {
  return http.post(`/contents/${contentId}/versions/${versionId}/rollback`);
}

// ---------- 审核 ----------
export function getReviews(params: PageQuery & { status?: string }): Promise<PageResult<Review>> {
  return http.get("/reviews", { params });
}

export function approveReview(id: string, comment?: string): Promise<Review> {
  return http.post(`/reviews/${id}/approve`, { comment });
}

export function rejectReview(id: string, comment?: string): Promise<Review> {
  return http.post(`/reviews/${id}/reject`, { comment });
}
