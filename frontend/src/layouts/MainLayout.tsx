import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GlobalOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Avatar, Layout, Menu, Select, App as AntdApp } from "antd";
import { navItems } from "@/router/nav";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";
import { usePermission } from "@/hooks/usePermission";
import { getAllTenants } from "@/api/tenant";
import { getProfile, logout as logoutApi } from "@/api/auth";
import { LOCALES } from "@/types";
import { Dropdown } from "@/components/ui/Dropdown";

const { Sider, Header, Content } = Layout;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermission();
  const { message } = AntdApp.useApp();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const setTenant = useTenantStore((s) => s.setTenant);
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: tenantList, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenants", "all"],
    queryFn: getAllTenants,
  });

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
      message.success(`已切换到「${tenant.name}」`);
    }
  };

  const switchLang = (locale: string) => {
    i18n.changeLanguage(locale);
  };

  const menuItems: MenuProps["items"] = navItems
    .map((item) => {
      if (item.children?.length) {
        const children = item.children
          .filter((c) => !c.permission || hasPermission(c.permission))
          .map((c) => ({ key: c.path, icon: <c.icon className="text-base" />, label: t(c.labelKey) }));
        if (children.length === 0) return null;
        return { key: item.key, icon: <item.icon className="text-base" />, label: t(item.labelKey), children };
      }
      if (item.permission && !hasPermission(item.permission)) return null;
      return { key: item.path, icon: <item.icon className="text-base" />, label: t(item.labelKey) };
    })
    .filter(Boolean) as MenuProps["items"];

  const userMenuItems = [
    {
      key: "profile",
      label: `${user?.name || "用户"}（${user?.username || ""}）`,
      disabled: true,
    },
    { key: "logout", label: "退出登录", danger: true, onClick: handleLogout },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        width={240}
        collapsedWidth={64}
        collapsed={collapsed}
        collapsible
        trigger={null}
        className="fixed inset-y-0 left-0 z-30 overflow-auto"
      >
        <div className="flex h-14 items-center gap-2 px-4" style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.04)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-sm font-bold text-white">
            C
          </div>
          {!collapsed && <span className="truncate text-base font-semibold text-gray-900">{t("appName")}</span>}
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["content-group", "system-group"]}
          onClick={({ key }) => key.startsWith("/") && navigate(key)}
          style={{ borderInlineEnd: "none" }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 240, transition: "margin-left 0.2s" }}>
        <Header
          className="fixed right-0 top-0 z-20 flex items-center justify-between px-4"
          style={{ left: collapsed ? 64 : 240, boxShadow: "0 1px 0 0 rgba(0,0,0,0.04)", transition: "left 0.2s" }}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-1">
            <Select
              value={currentTenant?.id || undefined}
              onChange={switchTenant}
              loading={tenantLoading}
              placeholder="选择租户"
              style={{ width: 160 }}
              variant="borderless"
              suffixIcon={<SettingOutlined className="text-primary" />}
              options={(tenantList || []).map((tenant) => ({ label: tenant.name, value: tenant.id }))}
            />

            <Dropdown
              trigger={<button className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"><GlobalOutlined /></button>}
              items={LOCALES.map((l) => ({
                key: l.code,
                label: l.label,
                onClick: () => switchLang(l.code),
              }))}
            />

            <Dropdown
              trigger={
                <button className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                  <Avatar size={28} style={{ backgroundColor: "#7C3AED" }} icon={<UserOutlined />} />
                  <span className="hidden sm:inline">{user?.name || "用户"}</span>
                </button>
              }
              items={userMenuItems}
            />
          </div>
        </Header>

        <Content className="pt-14">
          <div className="p-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
