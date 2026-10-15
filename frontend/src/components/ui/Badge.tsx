import { Tag } from "antd";
import { cn } from "@/lib/cn";

type BadgeColor = "gray" | "blue" | "green" | "red" | "orange" | "purple";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  gray: "default",
  blue: "blue",
  green: "green",
  red: "red",
  orange: "orange",
  purple: "purple",
};

export function Badge({ color = "gray", className, children, ...props }: BadgeProps) {
  return (
    <Tag className={cn("m-0", className)} color={colorMap[color]} {...props}>
      {children}
    </Tag>
  );
}
