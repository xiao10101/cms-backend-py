import { forwardRef } from "react";
import { Input as AntInput } from "antd";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return <AntInput.TextArea ref={ref} className={cn(className)} {...props} />;
});
