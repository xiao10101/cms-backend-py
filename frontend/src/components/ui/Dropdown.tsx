import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1 min-w-36 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg animate-fade-in",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
              className={cn(
                "flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm transition-colors",
                item.danger ? "text-danger hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
