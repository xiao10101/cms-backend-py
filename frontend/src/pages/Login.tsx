import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Globe2, Layers, Lock, ShieldCheck, User } from "lucide-react";
import { Button, Form, Input, Select, App as AntdApp } from "antd";
import { login } from "@/api/auth";
import { getAllTenants } from "@/api/tenant";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";

interface LoginFormValues {
  username: string;
  password: string;
  tenantCode: string;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntdApp.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTenant = useTenantStore((s) => s.setTenant);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  const { data: tenantList, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenants", "all"],
    queryFn: getAllTenants,
  });
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  async function handleFinish(values: LoginFormValues) {
    setSubmitting(true);
    try {
      const data = await login(values);
      setAuth(data);
      setTenant(data.tenant);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("login failed", err);
      message.error((err as Error).message || "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#3B1D7A] via-primary to-primary-light p-12 text-white lg:flex">
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

          <Form<LoginFormValues>
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
            initialValues={{ username: "admin", password: "admin123" }}
            onFinish={handleFinish}
          >
            <Form.Item
              name="username"
              label={t("login.username")}
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input prefix={<User className="h-4 w-4 text-gray-400" />} placeholder="admin" />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("login.password")}
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password prefix={<Lock className="h-4 w-4 text-gray-400" />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              name="tenantCode"
              label={t("login.tenant")}
              rules={[{ required: true, message: "请选择租户" }]}
            >
              <Select
                loading={tenantLoading}
                placeholder={tenantLoading ? "租户加载中…" : "请选择租户"}
                options={(tenantList || []).map((tenant) => ({ label: tenant.name, value: tenant.code }))}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button htmlType="submit" loading={submitting} block size="large">
                {t("login.submit")}
              </Button>
            </Form.Item>
          </Form>

          {/* <p className="mt-6 text-center text-xs text-gray-400">{t("login.hint")}</p> */}
        </div>
      </div>
    </div>
  );
}
