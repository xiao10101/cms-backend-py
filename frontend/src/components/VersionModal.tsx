import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, RotateCcw } from "lucide-react";
import { getVersions, rollbackVersion } from "@/api/content";
import type { ContentVersion } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export interface VersionModalProps {
  open: boolean;
  contentId: string;
  currentBody: string;
  onClose: () => void;
  onRolledBack: () => void;
}

export function VersionModal({ open, contentId, currentBody, onClose, onRolledBack }: VersionModalProps) {
  const [selected, setSelected] = useState<ContentVersion | null>(null);
  const queryClient = useQueryClient();

  const { data: versions } = useQuery({
    queryKey: ["versions", contentId],
    queryFn: () => getVersions(contentId),
    enabled: open,
  });

  const rollback = useMutation({
    mutationFn: (v: ContentVersion) => rollbackVersion(contentId, v.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      onRolledBack();
    },
  });

  const current = selected || (versions && versions[0]) || null;
  const diff = current ? diffLines(htmlToText(currentBody).split("\n"), htmlToText(current.body).split("\n")) : [];

  return (
    <Modal
      open={open}
      title={
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> 版本历史
        </span>
      }
      onClose={onClose}
      width={760}
      footer={
        <Button variant="outline" onClick={onClose}>关闭</Button>
      }
    >
      <div className="grid grid-cols-[220px_1fr] gap-5">
        <div className="space-y-2">
          {(versions || []).map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={cn(
                "w-full cursor-pointer rounded-lg border p-3 text-left transition-colors",
                current?.id === v.id ? "border-primary bg-primary-subtle/50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">v{v.version}</span>
                {v.version === (versions?.[0]?.version ?? 0) && <Badge color="green">最新</Badge>}
              </div>
              <div className="mt-1 truncate text-xs text-gray-500">{v.changeNote || "—"}</div>
              <div className="mt-1 text-xs text-gray-400">{v.authorName} · {v.createdAt}</div>
            </button>
          ))}
        </div>

        <div>
          {current && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  版本 v{current.version} 与当前版本的差异
                </span>
                <Button
                  size="sm"
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  loading={rollback.isPending}
                  onClick={() => rollback.mutate(current)}
                >
                  回滚到此版本
                </Button>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-100 bg-surface-muted/40 p-3 font-mono text-xs">
                {diff.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap py-0.5",
                      row.type === "add" && "bg-green-50 text-success",
                      row.type === "del" && "bg-red-50 text-danger line-through",
                      row.type === "same" && "text-gray-500"
                    )}
                  >
                    {row.type === "add" ? "+ " : row.type === "del" ? "- " : "  "}
                    {row.text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

type DiffRow = { type: "same" | "add" | "del"; text: string };

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function diffLines(a: string[], b: string[]): DiffRow[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", text: a[i] });
      i++;
    } else {
      rows.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) rows.push({ type: "del", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return rows;
}
