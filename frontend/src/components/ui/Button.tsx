import { forwardRef } from "react";
import { Button as AntButton } from "antd";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  /** 兼容原生 form 提交场景（antd 的 type 是样式类型，提交用 htmlType） */
  htmlType?: "button" | "submit" | "reset";
}

const variantMap: Record<Variant, { type: "primary" | "default" | "text"; danger?: boolean }> = {
  primary: { type: "primary" },
  secondary: { type: "text" },
  ghost: { type: "text" },
  danger: { type: "primary", danger: true },
  outline: { type: "default" },
};

const sizeMap: Record<Size, "small" | "middle" | "large"> = {
  sm: "small",
  md: "middle",
  lg: "large",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, className, children, type, htmlType, ...props },
  ref
) {
  const v = variantMap[variant];
  return (
    <AntButton
      ref={ref}
      type={v.type}
      danger={v.danger}
      size={sizeMap[size]}
      loading={loading}
      icon={icon}
      htmlType={(type as "submit" | "reset" | undefined) ?? htmlType}
      className={cn(className)}
      {...props}
    >
      {children}
    </AntButton>
  );
});
