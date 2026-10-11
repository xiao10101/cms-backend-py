import { useAuthStore } from "@/stores/auth";
import { Button, type ButtonProps } from "@/components/ui/Button";

export interface PermissionButtonProps extends ButtonProps {
  permission: string;
}

export function PermissionButton({ permission, children, ...props }: PermissionButtonProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  if (!hasPermission(permission)) return null;
  return <Button {...props}>{children}</Button>;
}
