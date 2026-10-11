import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import {
  archiveContent,
  deleteContent,
  getContents,
  publishContent,
  scheduleContent,
  submitReview,
  type ContentQuery,
} from "@/api/content";
import { getCategoryTree } from "@/api/category";
import type { Content, ContentStatus } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { PermissionButton } from "@/components/PermissionButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, type Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ContentStatusTag } from "@/components/StatusTag";
import { VersionModal } from "@/components/VersionModal";

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: "draft" },
  { label: "待审核", value: "pending" },
  { label: "已审核", value: "approved" },
  { label: "已发布", value: "published" },
  { label: "已驳回", value: "rejected" },
  { label: "已下线", value: "archived" },
];

export default function ContentList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<ContentQuery>({ page: 1, pageSize: 10 });
  const [versionContent, setVersionContent] = useState<Content | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<Content | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["contents", query],
    queryFn: () => getContents(query),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategoryTree });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["contents"] });
  const submit = useMutation({ mutationFn: submitReview, onSuccess: invalidate });
  const publish = useMutation({ mutationFn: publishContent, onSuccess: invalidate });
  const archive = useMutation({ mutationFn: archiveContent, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteContent, onSuccess: invalidate });

  function actions(c: Content): DropdownItem[] {
    const list: DropdownItem[] = [];
    if (c.status === "draft" || c.status === "rejected") {
      list.push({ key: "submit", label: "提交审核", onClick: () => submit.mutate(c.id) });
    }
    if (c.status === "approved") {
      list.push({ key: "publish", label: "立即发布", onClick: () => publish.mutate(c.id) });
    }
    if (c.status === "published") {
      list.push({ key: "archive", label: "下线", onClick: () => archive.mutate(c.id) });
    }
    if (c.status === "draft" || c.status === "approved") {
      list.push({ key: "schedule", label: "定时发布", onClick: () => setScheduleTarget(c) });
    }
    list.push({ key: "versions", label: "版本历史", onClick: () => setVersionContent(c) });
    list.push({ key: "delete", label: "删除", danger: true, onClick: () => remove.mutate(c.id) });
    return list;
  }

  const columns: Column<Content>[] = [
    {
      key: "title",
      title: "标题",
      render: (r) => (
        <div>
          <div className="font-medium text-gray-900">{r.translations[0]?.title || "未命名"}</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {r.translations.length > 1 && (
              <Badge color="blue">{r.translations.length} 语言</Badge>
            )}
            {r.translations.map((t) => (
              <span key={t.locale} className="text-xs text-gray-400">{t.locale}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "栏目",
      render: (r) => (
        <Badge color="gray">{categories?.find((c) => c.id === r.categoryId)?.name || r.categoryId}</Badge>
      ),
    },
    { key: "status", title: "状态", render: (r) => <ContentStatusTag status={r.status} /> },
    { key: "author", title: "作者", render: (r) => <span className="text-gray-600">{r.authorName}</span> },
    { key: "version", title: "版本", align: "center", render: (r) => <span className="text-gray-500">v{r.version}</span> },
    { key: "updatedAt", title: "更新时间", render: (r) => <span className="text-gray-400">{r.updatedAt}</span> },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/content/${r.id}/edit`)}>
            编辑
          </Button>
          <Dropdown
            align="right"
            trigger={
              <button className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={actions(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="内容管理"
        description="管理多语言内容，支持草稿、审核、发布全流程"
        extra={
          <PermissionButton permission="content:write" icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/content/new/edit")}>
            新建内容
          </PermissionButton>
        }
      />

      <div className="card p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query.keyword || ""}
              onChange={(e) => { setQuery({ ...query, keyword: e.target.value, page: 1 }); setPage(1); }}
              placeholder="搜索标题"
              className="pl-9"
            />
          </div>
          <Select
            value={query.status || ""}
            onChange={(e) => { setQuery({ ...query, status: e.target.value as ContentStatus, page: 1 }); setPage(1); }}
            options={statusOptions}
            className="w-32"
          />
          <Select
            value={query.categoryId || ""}
            onChange={(e) => { setQuery({ ...query, categoryId: e.target.value, page: 1 }); setPage(1); }}
            options={[{ label: "全部栏目", value: "" }, ...(categories || []).map((c) => ({ label: c.name, value: c.id }))]}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={data?.items || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无内容" />
        <Pagination page={page} pageSize={10} total={data?.total || 0} onChange={(p) => { setPage(p); setQuery({ ...query, page: p }); }} />
      </div>

      {versionContent && (
        <VersionModal
          open
          contentId={versionContent.id}
          currentBody={versionContent.translations[0]?.body || ""}
          onClose={() => setVersionContent(null)}
          onRolledBack={() => setVersionContent(null)}
        />
      )}

      <ScheduleModal
        content={scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        onSaved={() => { setScheduleTarget(null); invalidate(); }}
      />
    </div>
  );
}

function ScheduleModal({ content, onClose, onSaved }: { content: Content | null; onClose: () => void; onSaved: () => void }) {
  const [time, setTime] = useState("");
  const save = useMutation({
    mutationFn: () => scheduleContent(content!.id, time),
    onSuccess: onSaved,
  });

  return (
    <Modal
      open={!!content}
      title="定时发布"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button loading={save.isPending} disabled={!time} onClick={() => save.mutate()}>确定</Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-gray-500">
        内容「{content?.translations[0]?.title}」将在指定时间自动发布。
      </p>
      <Input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
    </Modal>
  );
}
