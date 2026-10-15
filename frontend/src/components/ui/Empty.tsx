import { Empty as AntEmpty } from "antd";

export interface EmptyProps {
  text?: string;
}

export function Empty({ text = "暂无数据" }: EmptyProps) {
  return (
    <AntEmpty
      image={AntEmpty.PRESENTED_IMAGE_SIMPLE}
      description={text}
      className="py-8"
    />
  );
}
