import type { ThemeConfig } from "antd";

/** 品牌主色：紫罗兰。全站换色只改这里 + tailwind.config.js 的 primary */
export const BRAND_COLOR = "#7C3AED";
export const BRAND_COLOR_LIGHT = "#8B5CF6";
export const BRAND_COLOR_SUBTLE = "#EDE9FE";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND_COLOR,
    colorInfo: BRAND_COLOR,
    colorLink: BRAND_COLOR,
    borderRadius: 8,
  },
  components: {
    Layout: {
      siderBg: "#ffffff",
      headerBg: "#ffffff",
      bodyBg: "#F3F3F3",
    },
    Table: {
      headerBg: "#F8F9FB",
      headerColor: "#6b7280",
      rowHoverBg: "#FAFAFC",
    },
  },
};
