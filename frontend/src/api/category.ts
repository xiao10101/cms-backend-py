import http from "./http";
import type { Category } from "@/types";

export function getCategoryTree(): Promise<Category[]> {
  return http.get("/categories/tree");
}

export function createCategory(data: Partial<Category>): Promise<Category> {
  return http.post("/categories", data);
}

export function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return http.patch(`/categories/${id}`, data);
}

export function deleteCategory(id: string): Promise<void> {
  return http.delete(`/categories/${id}`);
}

export function reorderCategories(items: { id: string; order: number; parentId: string | null }[]): Promise<void> {
  return http.patch("/categories/reorder", { items });
}
