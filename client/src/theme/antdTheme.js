import { theme } from "antd";

// Light theme configuration with modern, soft bluish-gray palette
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors with soft bluish tone
    colorPrimary: "#3a6ea5", // Modern soft blue primary
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#3a6ea5",

    // Modern bluish-gray background system
    colorBgBase: "#e8eaed", // Main background - soft bluish-gray
    colorBgContainer: "#f4f6f8", // Card/panel backgrounds - lighter bluish
    colorBgElevated: "#f4f6f8", // Elevated surfaces consistent with containers
    colorBgLayout: "#e8eaed", // Layout background matches base

    // Structured border colors
    colorBorder: "#bcc3ce", // Darker neutral gray borders for definition
    colorBorderSecondary: "#d1d5db", // Secondary borders with subtle presence

    // Enhanced text contrast on bluish background
    colorTextBase: "#1e1e1e", // Primary text - deep charcoal
    colorTextSecondary: "#5f6368", // Muted text - soft gray
    colorTextTertiary: "#9aa0a6", // Light gray for tertiary text

    // Alternative fill for visual hierarchy
    colorFillAlter: "#e0e3e8", // Hover/disabled background - subtle bluish

    // Other design tokens
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: "#f4f6f8", // Card/panel background for header
      siderBg: "#dde3ea", // Distinct sidebar with soft bluish tone
      bodyBg: "#e8eaed", // Matches main background
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      itemBg: "#dde3ea", // Matches sidebar background
      itemSelectedBg: "#c8d6e8", // Soft blue selection matching primary
      itemHoverBg: "#e1e8f0", // Subtle bluish hover
      itemColor: "#1e1e1e", // Consistent with enhanced text base
      itemSelectedColor: "#3a6ea5", // Matches primary color
      itemHoverColor: "#3a6ea5",
    },
    Card: {
      borderRadiusLG: 8,
      // Soft shadows for depth without harshness
      boxShadowTertiary:
        "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
      // Structured borders for definition
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#bcc3ce",
    },
    Button: {
      borderRadius: 6,
    },
    Drawer: {
      colorBgElevated: "#f4f6f8", // No pure white, use container background
    },
  },
};

// Dark theme configuration using Ant Design's design tokens
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary colors for dark mode
    colorPrimary: "#4096FF", // Brighter blue for dark backgrounds
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#4096FF",

    // Dark background colors
    colorBgBase: "#141414", // page background
    colorBgContainer: "#1F1F1F", // cards/panels
    colorBgElevated: "#1F1F1F", // elevated surfaces
    colorBgLayout: "#141414", // layout background

    // Dark border colors
    colorBorder: "#303030", // visible borders in dark mode
    colorBorderSecondary: "transparent", // hidden secondary borders

    // Dark text colors
    colorTextBase: "#FFFFFFD9", // primary text (85% opacity)
    colorTextSecondary: "#FFFFFFA6", // secondary text (65% opacity)
    colorTextTertiary: "#FFFFFF73", // tertiary text (45% opacity)

    // Other design tokens
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: "#1F1F1F",
      siderBg: "#141414", // Dark sidebar
      bodyBg: "#141414",
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      darkItemBg: "#141414",
      darkItemSelectedBg: "#1677FF", // Primary blue selection
      darkItemHoverBg: "#177DDC", // Darker blue hover
      darkItemColor: "#FFFFFFD9",
      darkItemSelectedColor: "#FFFFFF",
      darkItemHoverColor: "#FFFFFF",
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary:
        "0 1px 2px 0 rgba(0, 0, 0, 0.16), 0 1px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    },
    Button: {
      borderRadius: 6,
    },
    Drawer: {
      colorBgElevated: "#1F1F1F",
    },
  },
};

// Default export for backward compatibility
export default lightTheme;
