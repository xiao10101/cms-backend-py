import http from "./http";
import type { LoginRequest, LoginResponse, User } from "@/types";

export function login(data: LoginRequest): Promise<LoginResponse> {
  return http.post("/auth/login", data);
}

export function getProfile(): Promise<User> {
  return http.get("/auth/profile");
}

export function logout(): Promise<void> {
  return http.post("/auth/logout");
}
