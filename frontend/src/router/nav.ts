import {
  Building2,
  ClipboardCheck,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  ScrollText,
  Shield,
  Tags,
  Users,
} from "lucide-react";

export interface NavItem {
  key: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  permission?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  { key: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, path: "/dashboard", permission: "dashboard:read" },
  {
    key: "content-group",
    labelKey: "nav.groupContent",
    icon: FileText,
    path: "",
    children: [
      { key: "category", labelKey: "nav.category", icon: FolderTree, path: "/category", permission: "category:manage" },
      { key: "content", labelKey: "nav.content", icon: FileText, path: "/content", permission: "content:read" },
      { key: "review", labelKey: "nav.review", icon: ClipboardCheck, path: "/review", permission: "workflow:review" },
      { key: "media", labelKey: "nav.media", icon: Image, path: "/media", permission: "media:manage" },
      { key: "tag", labelKey: "nav.tag", icon: Tags, path: "/tag", permission: "tag:manage" },
    ],
  },
  {
    key: "system-group",
    labelKey: "nav.groupSystem",
    icon: Shield,
    path: "",
    children: [
      { key: "tenant", labelKey: "nav.tenant", icon: Building2, path: "/tenant", permission: "tenant:manage" },
      { key: "users", labelKey: "nav.users", icon: Users, path: "/users", permission: "user:manage" },
      { key: "roles", labelKey: "nav.roles", icon: Shield, path: "/roles", permission: "role:manage" },
      { key: "log", labelKey: "nav.log", icon: ScrollText, path: "/log", permission: "log:read" },
    ],
  },
];
