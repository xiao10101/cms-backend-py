import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe2, Layers, Lock, ShieldCheck, User } from "lucide-react";
import { login } from "@/api/auth";
import { getAllTenants } from "@/api/tenant";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTenant = useTenantStore((s) => s.setTenant);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [tenantCode, setTenantCode] = useState("yunshan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: tenantList } = useQuery({ queryKey: ["tenants", "all"], queryFn: getAllTenants });
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login({ username, password, tenantCode });
      setAuth(data);
      setTenant(data.tenant);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("login failed", err);
      setError((err as Error).message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#002C77] via-primary to-primary-light p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
            C
          </div>
          <span className="text-xl font-semibold">{t("appName")}</span>
        </div>

        <div className="relative">
          <h1 className="mb-4 text-3xl font-semibold leading-snug">
            一站式内容创作、
            <br />
            审核与发布平台
          </h1>
          <p className="mb-8 max-w-md text-white/80">
            面向企业内容团队的多租户、多语言内容管理系统，覆盖从创作、审核到定时发布的完整生命周期。
          </p>
          <div className="space-y-4">
            {[
              { icon: <Layers className="h-5 w-5" />, text: "多租户数据隔离，各站点独立管理" },
              { icon: <Globe2 className="h-5 w-5" />, text: "多语言内容，一套数据多端输出" },
              { icon: <ShieldCheck className="h-5 w-5" />, text: "细粒度 RBAC 权限，接口级安全" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  {f.icon}
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-white/60">© 2026 内容管理平台</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <h2 className="mb-1 text-2xl font-semibold text-gray-900">{t("login.title")}</h2>
          <p className="mb-8 text-sm text-gray-500">{t("login.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-gray-600">{t("login.username")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 pl-9"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600">{t("login.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600">{t("login.tenant")}</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Select
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value)}
                  options={(tenantList || []).map((tenant) => ({ label: tenant.name, value: tenant.code }))}
                  className="w-full [&>select]:h-10 [&>select]:pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>
            )}

            <Button type="submit" loading={loading} className="h-10 w-full">
              {t("login.submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">{t("login.hint")}</p>
        </div>
      </div>
    </div>
  );
}
