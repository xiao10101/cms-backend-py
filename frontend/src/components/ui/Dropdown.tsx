import { Dropdown as AntDropdown } from "antd";

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  return (
    <AntDropdown
      placement={align === "right" ? "bottomRight" : "bottomLeft"}
      menu={{
        items: items.map((i) => ({ key: i.key, label: i.label, danger: i.danger })),
        onClick: ({ key }) => items.find((i) => i.key === key)?.onClick?.(),
      }}
      trigger={["click"]}
    >
      {trigger as React.ReactElement}
    </AntDropdown>
  );
}
