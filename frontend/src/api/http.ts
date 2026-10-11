import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 15000,
});

// 请求拦截器：注入 access token 与租户上下文
http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  const { currentTenantId } = useTenantStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (currentTenantId) config.headers["X-Tenant-Id"] = currentTenantId;
  return config;
});

// 响应拦截器：解包统一响应结构并处理错误
http.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "code" in body) {
      if (body.code === 0 || body.code === 200) return body.data;
      return Promise.reject(new Error(body.message || "请求失败"));
    }
    return body;
  },
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const isLoginRequest = (original.url || "").includes("/auth/login");
    // 登录失败的 401 直接透出错误信息，不走刷新/重定向
    if (isLoginRequest) {
      return Promise.reject(new Error(error.response?.data?.message || "登录失败"));
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const { accessToken } = useAuthStore.getState();
        original.headers = { ...original.headers, Authorization: `Bearer ${accessToken}` };
        return http(original);
      }
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 使用独立实例刷新 token，避免拦截器递归
async function tryRefreshToken(): Promise<boolean> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/auth/refresh`,
      { refreshToken },
      { headers: { "X-Tenant-Id": useTenantStore.getState().currentTenantId } }
    );
    const data = res.data?.data ?? res.data;
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch (err) {
    console.error("refresh token failed", err);
    return false;
  }
}

export default http;
