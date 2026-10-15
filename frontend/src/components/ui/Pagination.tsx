import { Pagination as AntPagination } from "antd";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-sm text-gray-500">共 {total} 条</span>
      <AntPagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(p) => onChange(p)}
        showSizeChanger={false}
        showQuickJumper={false}
      />
    </div>
  );
}
