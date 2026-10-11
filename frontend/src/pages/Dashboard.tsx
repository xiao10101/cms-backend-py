import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Users,
} from "lucide-react";
import { getDashboardStats } from "@/api/dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/Badge";

const PIE_COLORS = ["#0052D9", "#366EF4", "#00A870", "#ED7B2F", "#8B5CF6"];

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardStats });

  const cards = [
    { label: "内容总数", value: data?.totalContents ?? 0, icon: FileText, iconBg: "bg-primary-subtle text-primary" },
    { label: "已发布", value: data?.publishedContents ?? 0, icon: CheckCircle2, iconBg: "bg-green-50 text-success" },
    { label: "待审核", value: data?.pendingReviews ?? 0, icon: Clock, iconBg: "bg-orange-50 text-warning" },
    { label: "成员", value: data?.totalUsers ?? 0, icon: Users, iconBg: "bg-purple-50 text-purple-600" },
    { label: "媒体资源", value: data?.totalMedia ?? 0, icon: Image, iconBg: "bg-cyan-50 text-cyan-600" },
  ];

  return (
    <div>
      <PageHeader title="工作台" description="内容运营数据总览与最近动态" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.iconBg}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {isLoading ? "—" : c.value}
              </div>
              <div className="text-xs text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">内容发布趋势（近 7 天）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []}>
                <defs>
                  <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052D9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0052D9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0052D9" strokeWidth={2} fill="url(#trend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">栏目内容分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {(data?.categoryDistribution || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {(data?.categoryDistribution || []).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="text-gray-400">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">最近动态</h3>
        <div className="space-y-3">
          {(data?.recentLogs || []).map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Badge color="blue">{log.module}</Badge>
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{log.userName}</span> {log.action}
                </span>
                <span className="text-sm text-gray-400">「{log.target}」</span>
              </div>
              <span className="text-xs text-gray-400">{log.createdAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
