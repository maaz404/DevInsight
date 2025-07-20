import { theme } from "antd";

// Light theme configuration using softer, more subtle colors
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors following Ant Design guidelines
    colorPrimary: "#1677FF", // Consistent primary blue
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677FF",

    // Softer background colors for modern, subtle appearance
    colorBgBase: "#f5f7fa", // Soft off-white page background
    colorBgContainer: "#fcfcfc", // Near-white cards/panels
    colorBgElevated: "#fcfcfc", // Consistent elevated surfaces
    colorBgLayout: "#f5f7fa", // Layout background matches base

    // Subtle border colors
    colorBorder: "#e0e0e0", // Soft neutral gray borders
    colorBorderSecondary: "#f0f2f5", // Very subtle secondary borders

    // Improved text contrast while maintaining softness
    colorTextBase: "#1f1f1f", // Deep charcoal for primary text
    colorTextSecondary: "#4b4b4b", // Medium gray for secondary text
    colorTextTertiary: "#8c8c8c", // Light gray for tertiary text

    // Alternative fill for subtle backgrounds
    colorFillAlter: "#f0f2f5", // Subtle fill for alternating rows

    // Other design tokens
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: "#fcfcfc", // Soft near-white header
      siderBg: "#f8f9fa", // Slightly darker sidebar for definition
      bodyBg: "#f5f7fa", // Matches page background
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      itemBg: "#f8f9fa", // Matches sidebar background
      itemSelectedBg: "#E6F4FF", // Light blue selection
      itemHoverBg: "#F0F9FF", // Subtle hover
      itemColor: "#1f1f1f", // Consistent with text base
      itemSelectedColor: "#1677FF",
      itemHoverColor: "#1677FF",
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary:
        "0 2px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 4px 0 rgba(0, 0, 0, 0.04)", // Soft shadows instead of borders
    },
    Button: {
      borderRadius: 6,
    },
    Drawer: {
      colorBgElevated: "#FFFFFF",
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
