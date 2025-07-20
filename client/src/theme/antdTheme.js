import { ConfigProvider } from 'antd';

export const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#fff',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
    Card: {
      borderRadiusLG: 8,
    },
    Button: {
      borderRadius: 6,
    },
  },
};

export default antdTheme;
