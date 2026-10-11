import { cn } from "@/lib/cn";

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            "relative cursor-pointer whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
            activeKey === item.key ? "text-primary" : "text-gray-500 hover:text-gray-700"
          )}
        >
          {item.label}
          {activeKey === item.key && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
