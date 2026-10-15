import { Tabs as AntTabs } from "antd";

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <AntTabs
      activeKey={activeKey}
      onChange={onChange}
      items={items.map((i) => ({ key: i.key, label: i.label }))}
    />
  );
}
