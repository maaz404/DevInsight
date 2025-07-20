
import 'antd/dist/reset.css'; // Ant Design v5+ global styles
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.jsx';
import './index.css';
import antdTheme from './theme/antdTheme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
