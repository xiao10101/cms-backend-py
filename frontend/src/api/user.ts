import http from "./http";
import type { PageQuery, PageResult, Permission, Role, User } from "@/types";

export function getUsers(params: PageQuery): Promise<PageResult<User>> {
  return http.get("/users", { params });
}

export function createUser(data: Partial<User>): Promise<User> {
  return http.post("/users", data);
}

export function updateUser(id: string, data: Partial<User>): Promise<User> {
  return http.patch(`/users/${id}`, data);
}

export function deleteUser(id: string): Promise<void> {
  return http.delete(`/users/${id}`);
}

export function getRoles(): Promise<Role[]> {
  return http.get("/roles");
}

export function createRole(data: Partial<Role>): Promise<Role> {
  return http.post("/roles", data);
}

export function updateRole(id: string, data: Partial<Role>): Promise<Role> {
  return http.patch(`/roles/${id}`, data);
}

export function deleteRole(id: string): Promise<void> {
  return http.delete(`/roles/${id}`);
}

export function getPermissions(): Promise<Permission[]> {
  return http.get("/permissions");
}
