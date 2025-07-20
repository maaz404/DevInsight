import { theme } from "antd";

// Light theme configuration with improved visual contrast and structure
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors following Ant Design guidelines
    colorPrimary: "#1677FF", // Consistent primary blue
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677FF",

    // Improved background colors for better visual separation
    colorBgBase: "#EEF1F5", // Darker, muted base background
    colorBgContainer: "#FAFAFA", // Slightly raised container background
    colorBgElevated: "#FAFAFA", // Elevated surfaces with clear distinction
    colorBgLayout: "#EEF1F5", // Layout background matches base

    // More visible border colors for structure
    colorBorder: "#C9CED6", // Darker, more visible borders
    colorBorderSecondary: "#E5E8EC", // Secondary borders with more presence

    // Enhanced text contrast
    colorTextBase: "#1C1C1C", // Darker text for better readability
    colorTextSecondary: "#5A5A5A", // Medium gray with good contrast
    colorTextTertiary: "#8c8c8c", // Light gray for tertiary text

    // Alternative fill for visual hierarchy
    colorFillAlter: "#E5E8EC", // Subtle fill for hover/disabled states

    // Other design tokens
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: "#FAFAFA", // Raised container background for header
      siderBg: "#F0F2F5", // Distinct sidebar background with separation
      bodyBg: "#EEF1F5", // Matches darker base background
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      itemBg: "#F0F2F5", // Matches sidebar background
      itemSelectedBg: "#E6F4FF", // Light blue selection
      itemHoverBg: "#F0F9FF", // Subtle hover
      itemColor: "#1C1C1C", // Consistent with enhanced text base
      itemSelectedColor: "#1677FF",
      itemHoverColor: "#1677FF",
    },
    Card: {
      borderRadiusLG: 8,
      // Enhanced shadows for better depth and visual separation
      boxShadowTertiary: "0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)",
      // Add visible borders for structure
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#C9CED6",
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
