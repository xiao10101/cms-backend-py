import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLogs } from "@/api/log";
import type { OperationLog as LogType } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Select } from "@/components/ui/Select";
import { Table, type Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";

const MODULES = ["内容管理", "审核中心", "成员管理", "角色权限", "媒体资源", "租户管理"];

const actionColor: Record<string, "blue" | "green" | "orange" | "red"> = {
  更新内容: "blue",
  新增用户: "green",
  审核通过: "green",
  驳回内容: "red",
  提交审核: "orange",
  上传媒体: "blue",
  配置角色: "blue",
  调整租户套餐: "orange",
};

export default function OperationLog() {
  const [page, setPage] = useState(1);
  const [module, setModule] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["logs", page, module],
    queryFn: () => getLogs({ page, pageSize: 10, module }),
  });

  const columns: Column<LogType>[] = [
    { key: "userName", title: "操作人", render: (r) => <span className="font-medium text-gray-800">{r.userName}</span> },
    {
      key: "action",
      title: "操作",
      render: (r) => <Badge color={actionColor[r.action] || "blue"}>{r.action}</Badge>,
    },
    { key: "module", title: "模块", render: (r) => <span className="text-gray-600">{r.module}</span> },
    { key: "target", title: "对象", render: (r) => <span className="text-gray-600">{r.target}</span> },
    { key: "ip", title: "IP 地址", render: (r) => <span className="text-gray-400">{r.ip || "—"}</span> },
    { key: "createdAt", title: "时间", render: (r) => <span className="text-gray-400">{r.createdAt}</span> },
  ];

  return (
    <div>
      <PageHeader title="操作日志" description="审计与追溯系统内的关键操作" />

      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Select
            value={module}
            onChange={(e) => { setModule(e.target.value); setPage(1); }}
            options={[{ label: "全部模块", value: "" }, ...MODULES.map((m) => ({ label: m, value: m }))]}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={data?.items || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无日志" />
        <Pagination page={page} pageSize={10} total={data?.total || 0} onChange={setPage} />
      </div>
    </div>
  );
}
