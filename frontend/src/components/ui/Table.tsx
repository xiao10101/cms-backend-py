import { Table as AntTable } from "antd";
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
    <AntTable<T>
      rowKey={rowKey}
      columns={columns.map((col) => ({
        key: col.key,
        title: col.title,
        width: col.width,
        align: col.align === "center" ? "center" : col.align === "right" ? "right" : "left",
        dataIndex: col.render ? undefined : col.key,
        render: col.render ? (_: unknown, row: T, index: number) => col.render!(row, index) : undefined,
      }))}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: <Empty text={emptyText} /> }}
    />
  );
}
