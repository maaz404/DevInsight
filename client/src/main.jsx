
import 'antd/dist/reset.css'; // Ant Design v5+ global styles
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { ThemeProvider, useTheme } from './theme/ThemeProvider.jsx';
import App from './App.jsx';
import './index.css';

// Wrapper component to use theme context
const ThemedApp = () => {
  const { currentTheme } = useTheme();
  
  return (
    <ConfigProvider theme={currentTheme}>
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
)
