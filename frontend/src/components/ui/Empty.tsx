import { Inbox } from "lucide-react";

export interface EmptyProps {
  text?: string;
}

export function Empty({ text = "暂无数据" }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
      <Inbox className="h-10 w-10 stroke-[1.5]" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
