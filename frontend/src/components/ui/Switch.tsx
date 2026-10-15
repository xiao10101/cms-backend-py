import { Switch as AntSwitch } from "antd";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return <AntSwitch checked={checked} disabled={disabled} onChange={(c) => onChange(c)} />;
}
