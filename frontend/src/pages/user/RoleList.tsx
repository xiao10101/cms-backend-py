import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, App as AntdApp, Spin } from "antd";
import { Plus } from "lucide-react";
import { createRole, deleteRole, getPermissions, getRoles, updateRole } from "@/api/user";
import { getApiErrorMessage } from "@/api/http";
import type { Permission, Role } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Table, type Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

export default function RoleList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const queryClient = useQueryClient();
  const { message, modal } = AntdApp.useApp();

  const { data: roles, isLoading, isError } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["roles"] });
  const remove = useMutation({ mutationFn: deleteRole, onSuccess: invalidate });

  const confirmDelete = (r: Role) => {
    modal.confirm({
      title: `删除角色「${r.name}」？`,
      content: "删除后前端将不再展示该角色，且不可再分配给用户。",
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await remove.mutateAsync(r.id);
          message.success(`角色「${r.name}」已删除`);
        } catch (err) {
          message.error(getApiErrorMessage(err, "删除失败"));
        }
      },
    });
  };

  const columns: Column<Role>[] = [
    {
      key: "name",
      title: "角色名称",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{r.name}</span>
          {r.builtIn && <Badge color="orange">内置</Badge>}
        </div>
      ),
    },
    { key: "code", title: "角色编码", render: (r) => <span className="text-gray-500">{r.code}</span> },
    { key: "description", title: "描述", render: (r) => <span className="text-gray-500">{r.description || "—"}</span> },
    {
      key: "perms",
      title: "权限数",
      align: "center",
      render: (r) => <Badge color="blue">{r.permissions.includes("*") ? "全部" : r.permissions.length}</Badge>,
    },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={() => { setEditing(r); setModalOpen(true); }}>配置权限</Button>
          {!r.builtIn && (
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => confirmDelete(r)}>删除</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="角色权限"
        description="基于角色的访问控制（RBAC），支持接口级权限配置"
        extra={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>新增角色</Button>}
      />
      <div className="card p-4">
        {isError && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message="角色列表加载失败"
            description="请确认后端服务已启动，且当前账号拥有 role:manage 权限。"
          />
        )}
        <Table columns={columns} data={roles || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无角色" />
      </div>

      <RoleForm open={modalOpen} role={editing} onClose={() => setModalOpen(false)} onSaved={invalidate} />
    </div>
  );
}

function RoleForm({ open, role, onClose, onSaved }: { open: boolean; role: Role | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Role>>({ permissions: [] });
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const { data: permissions, isError: permError, isLoading: permLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  if (open && !ready) {
    setForm(role || { name: "", code: "", description: "", permissions: [] });
    setReady(true);
  }

  function close() { setReady(false); onClose(); }

  const save = useMutation({
    mutationFn: () => (role ? updateRole(role.id, form) : createRole(form)),
    onSuccess: () => {
      message.success(role ? `角色「${form.name}」已更新` : `角色「${form.name}」已创建`);
      close();
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err, "保存失败")),
  });

  function handleSave() {
    if (!form.name?.trim() || !form.code?.trim()) {
      message.warning("请填写角色名称和角色编码");
      return;
    }
    save.mutate();
  }

  const selected: string[] = form.permissions || [];
  const togglePerm = (code: string) => {
    setForm((f) => ({
      ...f,
      permissions: (f.permissions || []).includes(code)
        ? (f.permissions || []).filter((x) => x !== code)
        : [...(f.permissions || []), code],
    }));
  };

  const groups = (permissions || []).reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});

  const allCodes = (permissions || []).map((p) => p.code);
  const allChecked = allCodes.every((c) => selected.includes(c));

  return (
    <Modal
      open={open}
      title={role ? `配置权限 · ${role.name}` : "新增角色"}
      onClose={close}
      width={640}
      footer={
        <>
          <Button variant="outline" onClick={close}>取消</Button>
          <Button loading={save.isPending} onClick={handleSave}>保存</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="角色名称">
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="角色编码">
          <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </Field>
        <div className="col-span-2">
          <Field label="描述">
            <Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">权限配置</span>
          <button
            type="button"
            className="cursor-pointer text-sm text-primary hover:underline"
            onClick={() => setForm({ ...form, permissions: allChecked ? [] : allCodes })}
          >
            {allChecked ? "取消全选" : "全选"}
          </button>
        </div>

        <div className="space-y-4">
          {permLoading && <Spin className="my-4" />}
          {permError && (
            <Alert
              type="warning"
              showIcon
              message="权限列表加载失败"
              description="后端尚未提供 GET /permissions 接口，无法展示可选权限点。此角色暂时只能保存基础信息，不能配置权限。"
            />
          )}
          {!permError && Object.entries(groups).map(([group, perms]) => (
            <div key={group}>
              <div className="mb-2 text-xs font-medium text-gray-400">{group}</div>
              <div className="flex flex-wrap gap-2">
                {perms.map((p) => (
                  <label
                    key={p.code}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      selected.includes(p.code)
                        ? "border-primary bg-primary-subtle text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-[#7C3AED]"
                      checked={selected.includes(p.code)}
                      onChange={() => togglePerm(p.code)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}
