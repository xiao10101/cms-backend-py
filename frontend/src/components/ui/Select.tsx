import { forwardRef } from "react";
import { Select as AntSelect } from "antd";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * antd Select 适配层：保持旧版「原生 select」的用法签名
 * （onChange 收到 { target: { value } }），页面无需改动即可获得 antd 的交互。
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, value, onChange, disabled, placeholder, ...props },
  ref
) {
  return (
    <AntSelect
      ref={ref as never}
      className={className}
      style={{ minWidth: 120, width: "100%" }}
      options={options}
      value={(value as string) === "" ? undefined : (value as string)}
      disabled={disabled}
      placeholder={placeholder ?? "请选择"}
      onChange={(v: string) =>
        (onChange as unknown as (e: { target: { value: string } }) => void)?.({ target: { value: v } })
      }
      // 原生 select 的 name/aria 等属性 antd 不消费，避免透传报错
      {...(Object.fromEntries(
        Object.entries(props).filter(([k]) => ["id", "name"].includes(k))
      ) as Record<string, never>)}
    />
  );
});
