import http from "./http";
import type { OperationLog, PageQuery, PageResult } from "@/types";

export function getLogs(params: PageQuery & { module?: string }): Promise<PageResult<OperationLog>> {
  return http.get("/logs", { params });
}
