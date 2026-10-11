import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { createUser, deleteUser, getRoles, getUsers, updateUser } from "@/api/user";
import type { Role, User } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Table, type Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { UserStatusTag } from "@/components/StatusTag";

export default function UserList() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, keyword],
    queryFn: () => getUsers({ page, pageSize: 10, keyword }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const toggleStatus = useMutation({
    mutationFn: (u: User) => updateUser(u.id, { status: u.status === "active" ? "disabled" : "active" }),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteUser, onSuccess: invalidate });

  const columns: Column<User>[] = [
    {
      key: "user",
      title: "用户",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle text-sm text-primary">
            {r.name.slice(0, 1)}
          </span>
          <div>
            <div className="font-medium text-gray-900">{r.name}</div>
            <div className="text-xs text-gray-400">@{r.username}</div>
          </div>
        </div>
      ),
    },
    { key: "email", title: "邮箱", render: (r) => <span className="text-gray-600">{r.email}</span> },
    {
      key: "roles",
      title: "角色",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.roles.map((role) => (
            <Badge key={role.id} color="blue">{role.name}</Badge>
          ))}
        </div>
      ),
    },
    { key: "status", title: "状态", render: (r) => <UserStatusTag status={r.status} /> },
    { key: "lastLoginAt", title: "最后登录", render: (r) => <span className="text-gray-400">{r.lastLoginAt || "从未"}</span> },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Switch checked={r.status === "active"} onChange={() => toggleStatus.mutate(r)} />
          <Button size="sm" variant="outline" onClick={() => { setEditing(r); setModalOpen(true); }}>编辑</Button>
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove.mutate(r.id)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="成员管理"
        description="管理租户内的成员账号与角色分配"
        extra={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>新增成员</Button>}
      />
      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} placeholder="搜索姓名或用户名" className="pl-9" />
          </div>
        </div>
        <Table columns={columns} data={data?.items || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无成员" />
        <Pagination page={page} pageSize={10} total={data?.total || 0} onChange={setPage} />
      </div>

      <UserForm open={modalOpen} user={editing} onClose={() => setModalOpen(false)} onSaved={invalidate} />
    </div>
  );
}

function UserForm({ open, user, onClose, onSaved }: { open: boolean; user: User | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<User> & { roleIds: string[] }>({ roleIds: [] });
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const { data: roleList } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  if (open && !ready) {
    setForm({ ...(user || { status: "active" }), roleIds: user?.roles.map((r) => r.id) || [] });
    setReady(true);
  }

  function close() { setReady(false); onClose(); }

  const save = useMutation({
    mutationFn: () => {
      const roles = (roleList || []).filter((r) => form.roleIds.includes(r.id));
      const payload = { name: form.name, username: form.username, email: form.email, roles };
      return user ? updateUser(user.id, payload) : createUser(payload);
    },
    onSuccess: () => { close(); onSaved(); queryClient.invalidateQueries({ queryKey: ["users"] }); },
  });

  const toggleRole = (id: string) => {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(id) ? f.roleIds.filter((x) => x !== id) : [...f.roleIds, id],
    }));
  };

  return (
    <Modal
      open={open}
      title={user ? "编辑成员" : "新增成员"}
      onClose={close}
      footer={
        <>
          <Button variant="outline" onClick={close}>取消</Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>保存</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="姓名">
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="用户名">
          <Input value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </Field>
        <div className="col-span-2">
          <Field label="邮箱">
            <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm text-gray-600">分配角色</label>
        <div className="flex flex-wrap gap-2">
          {(roleList || []).map((role: Role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => toggleRole(role.id)}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${
                form.roleIds.includes(role.id)
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {role.name}
            </button>
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
