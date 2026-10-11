import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { approveReview, getReviews, rejectReview } from "@/api/content";
import type { Review } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Table, type Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ReviewStatusTag } from "@/components/StatusTag";

export default function ReviewList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [target, setTarget] = useState<{ review: Review; action: "approve" | "reject" } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", status, page],
    queryFn: () => getReviews({ page, pageSize: 10, status }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["reviews"] });

  const columns: Column<Review>[] = [
    { key: "contentTitle", title: "内容标题", render: (r) => <span className="font-medium text-gray-900">{r.contentTitle}</span> },
    { key: "submitter", title: "提交人", render: (r) => <span className="text-gray-600">{r.submitterName}</span> },
    { key: "status", title: "状态", render: (r) => <ReviewStatusTag status={r.status} /> },
    { key: "createdAt", title: "提交时间", render: (r) => <span className="text-gray-400">{r.createdAt}</span> },
    {
      key: "comment",
      title: "审核意见",
      render: (r) => <span className="text-sm text-gray-500">{r.comment || "—"}</span>,
    },
    {
      key: "actions",
      title: "操作",
      align: "right",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => setTarget({ review: r, action: "approve" })}>
              通过
            </Button>
            <Button size="sm" variant="outline" className="text-danger" icon={<X className="h-3.5 w-3.5" />} onClick={() => setTarget({ review: r, action: "reject" })}>
              驳回
            </Button>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{r.reviewedByName} 已处理</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="审核中心" description="内容审核流转，通过后可进入发布环节" />

      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={[
              { label: "待审核", value: "pending" },
              { label: "已通过", value: "approved" },
              { label: "已驳回", value: "rejected" },
            ]}
            className="w-32"
          />
          <Badge color="orange">{data?.total || 0} 条待处理</Badge>
        </div>

        <Table columns={columns} data={data?.items || []} rowKey={(r) => r.id} loading={isLoading} emptyText="暂无审核任务" />
        <Pagination page={page} pageSize={10} total={data?.total || 0} onChange={setPage} />
      </div>

      <ReviewModal
        target={target}
        onClose={() => setTarget(null)}
        onDone={invalidate}
      />
    </div>
  );
}

function ReviewModal({ target, onClose, onDone }: { target: { review: Review; action: "approve" | "reject" } | null; onClose: () => void; onDone: () => void }) {
  const [comment, setComment] = useState("");
  const approve = useMutation({ mutationFn: () => approveReview(target!.review.id, comment), onSuccess: () => { setComment(""); onClose(); onDone(); } });
  const reject = useMutation({ mutationFn: () => rejectReview(target!.review.id, comment), onSuccess: () => { setComment(""); onClose(); onDone(); } });

  const isApprove = target?.action === "approve";
  const pending = approve.isPending || reject.isPending;

  return (
    <Modal
      open={!!target}
      title={isApprove ? "通过审核" : "驳回内容"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            variant={isApprove ? "primary" : "danger"}
            loading={pending}
            onClick={() => (isApprove ? approve.mutate() : reject.mutate())}
          >
            {isApprove ? "确认通过" : "确认驳回"}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-gray-500">
        内容「{target?.review.contentTitle}」
      </p>
      <label className="mb-1.5 block text-sm text-gray-600">审核意见（可选）</label>
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={isApprove ? "填写通过理由..." : "填写驳回原因..."}
      />
    </Modal>
  );
}
