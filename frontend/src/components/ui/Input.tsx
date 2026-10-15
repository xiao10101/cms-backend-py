import { forwardRef } from "react";
import { Input as AntInput } from "antd";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, size, ...props },
  ref
) {
  return (
    <AntInput
      ref={ref}
      status={error ? "error" : undefined}
      size={size === "lg" ? "large" : size === "sm" ? "small" : "middle"}
      className={cn(className)}
      {...props}
    />
  );
});
