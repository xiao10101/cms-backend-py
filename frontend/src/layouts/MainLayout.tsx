import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  User as UserIcon,
} from "lucide-react";
import { navItems, type NavItem } from "@/router/nav";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";
import { usePermission } from "@/hooks/usePermission";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/cn";
import { getAllTenants } from "@/api/tenant";
import { getProfile, logout as logoutApi } from "@/api/auth";
import { LOCALES } from "@/types";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermission();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const setTenant = useTenantStore((s) => s.setTenant);
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: tenantList } = useQuery({ queryKey: ["tenants", "all"], queryFn: getAllTenants });

  // 进入工作台时拉取最新用户信息（受保护请求，401 时由拦截器自动刷新重放）
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  useEffect(() => {
    if (profile) setUser(profile);
  }, [profile, setUser]);

  const handleLogout = async () => {
    await logoutApi().catch(() => undefined);
    logout();
    navigate("/login");
  };

  const switchTenant = (tenantId: string) => {
    const tenant = tenantList?.find((x) => x.id === tenantId);
    if (tenant) {
      setTenant(tenant);
      queryClient.invalidateQueries();
    }
  };

  const switchLang = (locale: string) => {
    i18n.changeLanguage(locale);
  };

  return (
    <div className="min-h-screen bg-surface">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ boxShadow: "1px 0 0 0 rgba(0,0,0,0.04)" }}
      >
        <div className="flex h-14 items-center gap-2 px-4" style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.04)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-sm font-bold text-white">
            C
          </div>
          {!collapsed && <span className="truncate text-base font-semibold text-gray-900">{t("appName")}</span>}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navItems.map((item) => (
            <NavGroup
              key={item.key}
              item={item}
              collapsed={collapsed}
              currentPath={location.pathname}
              hasPermission={hasPermission}
              t={t}
            />
          ))}
        </nav>
      </aside>

      <header
        className="fixed right-0 top-0 z-20 flex h-14 items-center justify-between bg-white px-4"
        style={{ left: collapsed ? 64 : 240, boxShadow: "0 1px 0 0 rgba(0,0,0,0.04)" }}
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-1">
          <Dropdown
            align="left"
            trigger={
              <button className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{currentTenant?.name || "选择租户"}</span>
              </button>
            }
            items={(tenantList || []).map((tenant) => ({
              key: tenant.id,
              label: (
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      currentTenant?.id === tenant.id ? "bg-success" : "bg-gray-300"
                    )}
                  />
                  {tenant.name}
                </span>
              ),
              onClick: () => switchTenant(tenant.id),
            }))}
          />

          <Dropdown
            align="left"
            trigger={
              <button className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100">
                <Globe className="h-4 w-4" />
              </button>
            }
            items={LOCALES.map((l) => ({
              key: l.code,
              label: l.label,
              onClick: () => switchLang(l.code),
            }))}
          />

          <Dropdown
            align="right"
            trigger={
              <button className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-primary">
                  <UserIcon className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">{user?.name || "用户"}</span>
              </button>
            }
            items={[
              { key: "profile", label: `${user?.name || "用户"}（${user?.username || ""}）` },
              { key: "logout", label: "退出登录", danger: true, onClick: handleLogout },
            ]}
          />
        </div>
      </header>

      <main
        className="pt-14 transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavGroup({
  item,
  collapsed,
  currentPath,
  hasPermission,
  t,
}: {
  item: NavItem;
  collapsed: boolean;
  currentPath: string;
  hasPermission: (code: string) => boolean;
  t: (key: string) => string;
}) {
  if (item.children?.length) {
    const children = item.children.filter((c) => !c.permission || hasPermission(c.permission));
    if (children.length === 0) return null;
    return (
      <div className="mb-1">
        {!collapsed && (
          <div className="px-3 pb-1 pt-3 text-xs font-medium text-gray-400">{t(item.labelKey)}</div>
        )}
        {children.map((child) => (
          <NavLeaf
            key={child.key}
            item={child}
            collapsed={collapsed}
            active={currentPath.startsWith(child.path)}
            t={t}
          />
        ))}
      </div>
    );
  }
  return (
    <NavLeaf
      item={item}
      collapsed={collapsed}
      active={currentPath === item.path}
      t={t}
    />
  );
}

function NavLeaf({
  item,
  collapsed,
  active,
  t,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  t: (key: string) => string;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      title={collapsed ? t(item.labelKey) : undefined}
      className={cn(
        "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary-subtle text-primary font-medium"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );
}
