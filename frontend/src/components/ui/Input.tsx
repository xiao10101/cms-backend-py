import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50",
        error && "border-danger focus:border-danger focus:ring-danger/20",
        className
      )}
      {...props}
    />
  );
});
