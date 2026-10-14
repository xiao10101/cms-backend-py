import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse, User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: string[];
  setAuth: (data: LoginResponse) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      permissions: [],
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          permissions: data.permissions,
        }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, permissions: [] }),
      // TODO(阶段 3 RBAC)：VITE_BYPASS_PERMISSION=true 时跳过权限判断（后端权限守卫尚未实现）
      hasPermission: (code) =>
        import.meta.env.VITE_BYPASS_PERMISSION === "true" ||
        get().permissions.includes("*") ||
        get().permissions.includes(code),
    }),
    { name: "cms-auth" }
  )
);
