import { useAuthStore } from "@/stores/auth";

export function usePermission() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const permissions = useAuthStore((s) => s.permissions);
  return { hasPermission, permissions };
}
