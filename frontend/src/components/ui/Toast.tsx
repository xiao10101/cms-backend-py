import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let toasts: ToastItem[] = [];
let seq = 0;
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  const snapshot = [...toasts];
  listeners.forEach((l) => l(snapshot));
}

function push(type: ToastType, message: string, duration = 3000) {
  const id = ++seq;
  toasts = [...toasts, { id, type, message }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-danger" />,
  info: <Info className="h-4 w-4 text-primary" />,
};

/** 全局 Toast 容器，挂在 App 根节点一次即可，业务里 import { toast } 直接调用 */
export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm shadow-lg animate-fade-in",
            t.type === "error" ? "border-red-200" : "border-gray-200"
          )}
        >
          {ICONS[t.type]}
          <span className="text-gray-800">{t.message}</span>
          <button
            className="ml-1 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => {
              toasts = toasts.filter((x) => x.id !== t.id);
              emit();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
