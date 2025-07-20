
import 'antd/dist/reset.css'; // Ant Design v5+ global styles
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.jsx';
import './index.css';
import { ThemeProvider, useTheme } from './theme/ThemeProvider.jsx';

// Wrapper component to access theme context
function AppWithTheme() {
  const { currentTheme } = useTheme();
  
  return (
    <ConfigProvider theme={currentTheme}>
      <App />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>,
)
