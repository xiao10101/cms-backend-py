import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, Trash2, Upload } from "lucide-react";
import { deleteMedia, getMedias, uploadMedia } from "@/api/media";
import type { Media } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Empty } from "@/components/ui/Empty";

export default function MediaLibrary() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media", page, keyword],
    queryFn: () => getMedias({ page, pageSize: 12, keyword }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["media"] });
  const upload = useMutation({ mutationFn: uploadMedia, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteMedia, onSuccess: invalidate });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = "";
  }

  return (
    <div>
      <PageHeader
        title="媒体资源"
        description="统一管理图片与文件资源，支持上传与引用"
        extra={
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
            <Button icon={<Upload className="h-4 w-4" />} loading={upload.isPending} onClick={() => inputRef.current?.click()}>
              上传文件
            </Button>
          </>
        }
      />

      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} placeholder="搜索文件名" className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">加载中...</div>
        ) : (data?.items.length || 0) === 0 ? (
          <Empty text="暂无媒体资源" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {(data?.items || []).map((m) => (
              <MediaCard key={m.id} media={m} onDelete={() => remove.mutate(m.id)} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={12} total={data?.total || 0} onChange={setPage} />
      </div>
    </div>
  );
}

function MediaCard({ media, onDelete }: { media: Media; onDelete: () => void }) {
  const isImage = media.mimeType.startsWith("image/") && !media.mimeType.includes("svg");
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted">
        {isImage ? (
          <img src={media.url} alt={media.filename} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <FileText className="h-10 w-10 text-gray-300" />
        )}
        <button
          onClick={onDelete}
          className="absolute right-2 top-2 cursor-pointer rounded-md bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2.5">
        <div className="truncate text-sm text-gray-700">{media.filename}</div>
        <div className="mt-0.5 text-xs text-gray-400">{formatSize(media.size)}</div>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
