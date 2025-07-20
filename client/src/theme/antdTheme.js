import { theme } from "antd";

// Light theme configuration
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    borderRadius: 6,
    wireframe: false,
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f8f9fa",
    colorBorder: "#e0e0e0",
    colorBorderSecondary: "#f0f0f0",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff", // Light sidebar for light mode
      bodyBg: "#f8f9fa",
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      itemBg: "#ffffff",
      itemSelectedBg: "#e6f7ff",
      itemHoverBg: "#f0f9ff",
      itemColor: "#333333",
      itemSelectedColor: "#1890ff",
      itemHoverColor: "#1890ff",
      // Dark menu items for light theme sidebar
      darkItemBg: "#ffffff", 
      darkItemSelectedBg: "#e6f7ff",
      darkItemHoverBg: "#f0f9ff",
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    },
    Button: {
      borderRadius: 6,
    },
  },
};

// Dark theme configuration
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    borderRadius: 6,
    wireframe: false,
    colorBgContainer: "#141414",
    colorBgElevated: "#1f1f1f",
    colorBgLayout: "#000000",
    colorBorder: "transparent",
    colorBorderSecondary: "transparent",
  },
  components: {
    Layout: {
      headerBg: "#141414",
      siderBg: "#001529", // Keep dark sidebar for dark mode
      bodyBg: "#000000",
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      darkItemBg: "#001529",
      darkItemSelectedBg: "#1890ff",
      darkItemHoverBg: "#1565c0",
      darkItemColor: "#ffffff",
      darkItemSelectedColor: "#ffffff",
      darkItemHoverColor: "#ffffff",
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary: "0 1px 2px 0 rgba(0, 0, 0, 0.16), 0 1px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    },
    Button: {
      borderRadius: 6,
    },
  },
};

// Default export for backward compatibility
export default lightTheme;
