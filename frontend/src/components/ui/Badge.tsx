import { cn } from "@/lib/cn";

type BadgeColor = "gray" | "blue" | "green" | "red" | "orange" | "purple";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorClasses: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-primary-subtle text-primary",
  green: "bg-green-50 text-success",
  red: "bg-red-50 text-danger",
  orange: "bg-orange-50 text-warning",
  purple: "bg-purple-50 text-purple-600",
};

export function Badge({ color = "gray", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
