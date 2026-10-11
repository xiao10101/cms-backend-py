import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Empty } from "./Empty";

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyText?: string;
}

export function Table<T>({ columns, data, rowKey, loading = false, emptyText }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "whitespace-nowrap border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  !col.align && "text-left"
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16">
                <Empty text={emptyText} />
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row)}
                className="border-b border-gray-50 transition-colors last:border-0 hover:bg-surface-muted/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-gray-700",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      !col.align && "text-left"
                    )}
                  >
                    {col.render ? col.render(row, index) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
