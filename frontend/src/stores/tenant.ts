import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tenant } from "@/types";

interface TenantState {
  currentTenant: Tenant | null;
  currentTenantId: string | null;
  setTenant: (tenant: Tenant) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenant: null,
      currentTenantId: null,
      setTenant: (tenant) => set({ currentTenant: tenant, currentTenantId: tenant.id }),
    }),
    { name: "cms-tenant" }
  )
);
