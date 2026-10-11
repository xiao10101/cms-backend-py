import http from "./http";
import type { DashboardStats } from "@/types";

export function getDashboardStats(): Promise<DashboardStats> {
  return http.get("/dashboard/stats");
}
