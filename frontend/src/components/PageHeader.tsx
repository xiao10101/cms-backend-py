import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, extra, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-start justify-between", className)}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
}
