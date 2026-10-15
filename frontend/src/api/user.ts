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

export async function getRoles(): Promise<Role[]> {
  // 后端 /roles 返回分页结构 Page<RoleOut>，这里统一解包成数组给页面用
  // pageSize 取最大值 100：角色数量少，一页拉全，前端不再单独分页
  const res = await http.get<unknown, PageResult<Role> | Role[]>("/roles", {
    params: { page: 1, pageSize: 100 },
  });
  return Array.isArray(res) ? res : (res?.items ?? []);
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
