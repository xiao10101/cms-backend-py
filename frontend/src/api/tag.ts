import http from "./http";
import type { Tag } from "@/types";

export function getTags(): Promise<Tag[]> {
  return http.get("/tags");
}

export function createTag(data: Partial<Tag>): Promise<Tag> {
  return http.post("/tags", data);
}

export function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  return http.patch(`/tags/${id}`, data);
}

export function deleteTag(id: string): Promise<void> {
  return http.delete(`/tags/${id}`);
}
