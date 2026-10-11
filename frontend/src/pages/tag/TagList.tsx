import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { createTag, deleteTag, getTags, updateTag } from "@/api/tag";
import type { Tag } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

const COLORS = ["#0052D9", "#366EF4", "#00A870", "#E34D59", "#ED7B2F", "#8B5CF6", "#0EA5E9", "#64748B"];

export default function TagList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["tags"], queryFn: getTags });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tags"] });
  const remove = useMutation({ mutationFn: deleteTag, onSuccess: invalidate });

  const columns: Column<Tag>[] = [
    {
      key: "name",
      title: "标签名称",
      render: (r) => (
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
          <span className="font-medium text-gray-800">{r.name}</span>
        </span>
      ),
    },
    { key: "slug", title: "Slug", render: (r) => <span className="text-gray-500">{r.slug}</span> },
    { key: "contentCount", title: "内容数", align: "center", render: (r) => <span className="text-gray-500">{r.contentCount ?? 0}</span> },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={() => { setEditing(r); setModalOpen(true); }}>编辑</Button>
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove.mutate(r.id)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="标签管理"
        description="为内容打标签，便于聚合与检索"
        extra={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>新增标签</Button>}
      />
      <div className="card p-4">
        <Table columns={columns} data={data || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无标签" />
      </div>

      <TagForm open={modalOpen} tag={editing} onClose={() => setModalOpen(false)} onSaved={invalidate} />
    </div>
  );
}

function TagForm({ open, tag, onClose, onSaved }: { open: boolean; tag: Tag | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Tag>>({ color: COLORS[0] });
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  if (open && !ready) {
    setForm(tag || { name: "", slug: "", color: COLORS[0] });
    setReady(true);
  }

  function close() { setReady(false); onClose(); }

  const save = useMutation({
    mutationFn: () => (tag ? updateTag(tag.id, form) : createTag(form)),
    onSuccess: () => { close(); onSaved(); queryClient.invalidateQueries({ queryKey: ["tags"] }); },
  });

  return (
    <Modal
      open={open}
      title={tag ? "编辑标签" : "新增标签"}
      onClose={close}
      footer={
        <>
          <Button variant="outline" onClick={close}>取消</Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>保存</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">标签名称</label>
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Slug</label>
          <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">颜色</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={cn(
                  "h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110",
                  form.color === c && "ring-2 ring-offset-2"
                )}
                style={{ background: c, ...(form.color === c ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${c}` } : {}) }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
