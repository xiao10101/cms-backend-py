import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { createTenant, deleteTenant, getTenants, updateTenant } from "@/api/tenant";
import { getApiErrorMessage } from "@/api/http";
import type { Tenant, TenantStatus } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Table, type Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { TenantStatusTag } from "@/components/StatusTag";

const CODE_PATTERN = /^[a-z0-9-]+$/;

export default function TenantList() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  // 待删除的租户，非空时弹出二次确认
  const [deleting, setDeleting] = useState<Tenant | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", page, keyword],
    queryFn: () => getTenants({ page, pageSize: 10, keyword }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tenants"] });

  const toggleStatus = useMutation({
    mutationFn: (t: Tenant) => {
      const next: TenantStatus = t.status === "active" ? "disabled" : "active";
      return updateTenant(t.id, { status: next }).then(() => next);
    },
    onSuccess: (next) => {
      toast.success(next === "active" ? "已启用" : "已禁用");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "操作失败")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      toast.success("删除成功");
      setDeleting(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "删除失败")),
  });

  const columns: Column<Tenant>[] = [
    { key: "name", title: "租户名称", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: "code", title: "租户编码", render: (r) => <span className="text-gray-500">{r.code}</span> },
    { key: "plan", title: "套餐" },
    { key: "maxUsers", title: "成员上限", align: "center" },
    { key: "contactName", title: "联系人", render: (r) => r.contactName || "—" },
    { key: "status", title: "状态", render: (r) => <TenantStatusTag status={r.status} /> },
    { key: "createdAt", title: "创建时间", render: (r) => <span className="text-gray-400">{r.createdAt}</span> },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Switch
            checked={r.status === "active"}
            onChange={() => toggleStatus.mutate(r)}
          />
          <Button size="sm" variant="outline" onClick={() => { setEditing(r); setModalOpen(true); }}>
            编辑
          </Button>
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => setDeleting(r)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="租户管理"
        description="管理平台下的租户与站点，各租户数据相互隔离"
        extra={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            新增租户
          </Button>
        }
      />

      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="搜索租户名称"
              className="pl-9"
            />
          </div>
        </div>

        <Table columns={columns} data={data?.items || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无租户" />
        <Pagination page={page} pageSize={10} total={data?.total || 0} onChange={setPage} />
      </div>

      <TenantForm
        open={modalOpen}
        tenant={editing}
        onClose={() => setModalOpen(false)}
        onSaved={invalidate}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="删除租户"
        danger
        loading={remove.isPending}
        confirmText="删除"
        content={
          <>
            确定删除租户 <span className="font-medium text-gray-900">{deleting?.name}</span> 吗？
            <br />
            删除后该租户将不再显示，此操作不可恢复。
          </>
        }
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

interface FormErrors {
  name?: string;
  code?: string;
  maxUsers?: string;
}

function TenantForm({ open, tenant, onClose, onSaved }: { open: boolean; tenant: Tenant | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Tenant>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  if (open && !ready) {
    setForm(tenant || { status: "active", plan: "基础版", maxUsers: 20 });
    setErrors({});
    setReady(true);
  }

  function close() {
    setReady(false);
    onClose();
  }

  const save = useMutation({
    mutationFn: () => (tenant ? updateTenant(tenant.id, form) : createTenant(form)),
    onSuccess: () => {
      toast.success(tenant ? "保存成功" : "新增成功");
      close();
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "保存失败")),
  });

  function setField(field: keyof FormErrors, value: Partial<Tenant>) {
    setForm(value);
    // 用户修改字段时清除该字段的错误提示
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function validate(): boolean {
    const next: FormErrors = {};
    const name = (form.name || "").trim();
    const code = (form.code || "").trim();
    if (!name) next.name = "请输入租户名称";
    else if (name.length < 2) next.name = "租户名称至少 2 个字符";
    if (!code) next.code = "请输入租户编码";
    else if (!CODE_PATTERN.test(code)) next.code = "仅支持小写字母、数字和中划线";
    if (form.maxUsers !== undefined && form.maxUsers < 1) next.maxUsers = "成员上限至少为 1";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    save.mutate();
  }

  return (
    <Modal
      open={open}
      title={tenant ? "编辑租户" : "新增租户"}
      onClose={close}
      footer={
        <>
          <Button variant="outline" onClick={close}>取消</Button>
          <Button loading={save.isPending} onClick={handleSubmit}>保存</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="租户名称" required error={errors.name}>
          <Input
            value={form.name || ""}
            onChange={(e) => setField("name", { ...form, name: e.target.value })}
            error={!!errors.name}
            placeholder="请输入租户名称"
          />
        </Field>
        <Field label="租户编码" required error={errors.code}>
          <Input
            value={form.code || ""}
            onChange={(e) => setField("code", { ...form, code: e.target.value })}
            error={!!errors.code}
            placeholder="如 acme-corp"
            disabled={!!tenant}
          />
        </Field>
        <Field label="套餐">
          <Select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            options={[{ label: "基础版", value: "基础版" }, { label: "专业版", value: "专业版" }, { label: "企业版", value: "企业版" }]}
            className="w-full"
          />
        </Field>
        <Field label="成员上限" error={errors.maxUsers}>
          <Input
            type="number"
            value={form.maxUsers ?? 20}
            onChange={(e) => setField("maxUsers", { ...form, maxUsers: Number(e.target.value) })}
            error={!!errors.maxUsers}
          />
        </Field>
        <Field label="联系人">
          <Input value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </Field>
        <Field label="联系邮箱">
          <Input value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-gray-600">
        {required && <span className="mr-0.5 text-danger">*</span>}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
