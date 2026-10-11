import http from "./http";
import type { Media, PageQuery, PageResult } from "@/types";

export function getMedias(params: PageQuery): Promise<PageResult<Media>> {
  return http.get("/media", { params });
}

export function uploadMedia(file: File): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  return http.post("/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteMedia(id: string): Promise<void> {
  return http.delete(`/media/${id}`);
}
