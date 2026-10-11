import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Plus } from "lucide-react";
import { createCategory, deleteCategory, getCategoryTree, updateCategory } from "@/api/category";
import type { Category } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Empty } from "@/components/ui/Empty";

export default function CategoryList() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategoryTree });
  const tree = buildTree(data || []);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });
  const remove = useMutation({ mutationFn: deleteCategory, onSuccess: invalidate });

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        title="栏目管理"
        description="树形组织内容栏目，支持层级与排序调整"
        extra={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setParentId(null); setModalOpen(true); }}>新增栏目</Button>}
      />

      <div className="card p-4">
        <div className="mb-2 grid grid-cols-[1fr_140px_1fr_210px] gap-4 border-b border-gray-100 px-3 pb-2 text-xs font-medium text-gray-400">
          <span>栏目名称</span>
          <span>Slug</span>
          <span>描述</span>
          <span className="text-right">操作</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">加载中...</div>
        ) : tree.length === 0 ? (
          <Empty text="暂无栏目" />
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              collapsed={collapsed}
              onToggle={toggle}
              onAdd={(pid) => { setEditing(null); setParentId(pid); setModalOpen(true); }}
              onEdit={(c) => { setEditing(c); setParentId(c.parentId); setModalOpen(true); }}
              onDelete={(c) => remove.mutate(c.id)}
            />
          ))
        )}
      </div>

      <CategoryForm
        open={modalOpen}
        category={editing}
        parentId={parentId}
        onClose={() => setModalOpen(false)}
        onSaved={invalidate}
      />
    </div>
  );
}

function TreeNode({
  node,
  depth,
  collapsed,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: {
  node: Category;
  depth: number;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (pid: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isCollapsed = collapsed.has(node.id);

  return (
    <Fragment>
      <div className="grid grid-cols-[1fr_140px_1fr_210px] items-center gap-4 border-b border-gray-50 px-3 py-2.5 transition-colors hover:bg-surface-muted/60">
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
          {hasChildren ? (
            <button onClick={() => onToggle(node.id)} className="cursor-pointer text-gray-400 hover:text-gray-600">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          {hasChildren ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400" />
          )}
          <span className="font-medium text-gray-800">{node.name}</span>
        </div>
        <span className="text-sm text-gray-500">{node.slug}</span>
        <span className="truncate text-sm text-gray-400">{node.description || "—"}</span>
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button size="sm" variant="ghost" className="shrink-0" onClick={() => onAdd(node.id)}>加子栏目</Button>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => onEdit(node)}>编辑</Button>
          <Button size="sm" variant="ghost" className="shrink-0 text-danger" onClick={() => onDelete(node)}>删除</Button>
        </div>
      </div>
      {hasChildren && !isCollapsed && node.children!.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          collapsed={collapsed}
          onToggle={onToggle}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Fragment>
  );
}

function CategoryForm({ open, category, parentId, onClose, onSaved }: { open: boolean; category: Category | null; parentId: string | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Category>>({});
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  if (open && !ready) {
    setForm(category || { name: "", slug: "", description: "", parentId });
    setReady(true);
  }

  function close() { setReady(false); onClose(); }

  const save = useMutation({
    mutationFn: () => (category ? updateCategory(category.id, form) : createCategory(form)),
    onSuccess: () => { close(); onSaved(); queryClient.invalidateQueries({ queryKey: ["categories"] }); },
  });

  return (
    <Modal
      open={open}
      title={category ? "编辑栏目" : "新增栏目"}
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
          <label className="mb-1.5 block text-sm text-gray-600">栏目名称</label>
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Slug</label>
          <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="如 news" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">描述</label>
          <Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}

function buildTree(list: Category[]): Category[] {
  const map = new Map<string, Category>();
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: Category[] = [];
  map.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(c);
    } else {
      roots.push(c);
    }
  });
  const sort = (nodes: Category[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => n.children && sort(n.children));
  };
  sort(roots);
  return roots;
}
