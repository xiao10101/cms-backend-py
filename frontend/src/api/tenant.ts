import http from "./http";
import type { PageQuery, PageResult, Tenant } from "@/types";

export function getTenants(params: PageQuery): Promise<PageResult<Tenant>> {
  return http.get("/tenants", { params });
}

export function getAllTenants(): Promise<Tenant[]> {
  return http.get("/tenants/all");
}

export function createTenant(data: Partial<Tenant>): Promise<Tenant> {
  return http.post("/tenants", data);
}

export function updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
  return http.patch(`/tenants/${id}`, data);
}

export function deleteTenant(id: string): Promise<void> {
  return http.delete(`/tenants/${id}`);
}
