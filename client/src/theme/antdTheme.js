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
    colorBgLayout: "#f5f5f5",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#001529",
      bodyBg: "#f5f5f5",
    },
    Menu: {
      darkItemBg: "#001529",
      darkItemSelectedBg: "#1890ff",
      darkItemHoverBg: "#1565c0",
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
  },
  components: {
    Layout: {
      headerBg: "#141414",
      siderBg: "#001529",
      bodyBg: "#000000",
    },
    Menu: {
      darkItemBg: "#001529",
      darkItemSelectedBg: "#1890ff",
      darkItemHoverBg: "#1565c0",
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
