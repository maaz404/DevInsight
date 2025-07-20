
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Switch, Space, Button, Drawer } from 'antd';
import {
  GithubOutlined,
  BarChartOutlined,
  SearchOutlined,
  BulbOutlined,
  BulbFilled,
  MenuOutlined,
} from '@ant-design/icons';
import { useTheme } from './theme/ThemeProvider';
import Home from './pages/Home';
import AnalyzeRepo from './pages/AnalyzeRepo';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const getSelectedKey = () => {
    if (location.pathname === '/analyze') return ['2'];
    return ['1'];
  };

  const menuItems = [
    {
      key: '1',
      icon: <BarChartOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <SearchOutlined />,
      label: <Link to="/analyze">Analyze Repo</Link>,
    },
  ];

  const SidebarContent = () => (
    <>
      <div style={{ 
        height: 64, 
        margin: '16px', 
        color: isDarkMode ? '#FFFFFFD9' : '#1677FF', 
        fontWeight: 'bold', 
        fontSize: 18, 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.3s ease'
      }}>
        <GithubOutlined style={{ marginRight: 8 }} />
        DevInsight
      </div>
      <Menu 
        theme={isDarkMode ? "dark" : "light"} 
        mode="inline" 
        selectedKeys={getSelectedKey()}
        items={menuItems}
        onClick={() => setDrawerVisible(false)}
        style={{
          border: 'none',
          transition: 'all 0.3s ease',
          background: isDarkMode ? '#141414' : '#FFFFFF'
        }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        theme={isDarkMode ? "dark" : "light"}
        style={{ 
          display: 'none',
          background: isDarkMode ? '#141414' : '#f8f9fa',
          borderRight: isDarkMode ? 'none' : '1px solid #e0e0e0',
          transition: 'all 0.3s ease'
        }}
        className="desktop-sider"
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space style={{ color: isDarkMode ? '#FFFFFFD9' : '#1f1f1f' }}>
            <GithubOutlined />
            DevInsight
          </Space>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ 
          padding: 0, 
          backgroundColor: isDarkMode ? '#141414' : '#f8f9fa',
          transition: 'background-color 0.3s ease'
        }}
        width={280}
        className="mobile-drawer"
      >
        <Menu 
          theme={isDarkMode ? "dark" : "light"} 
          mode="inline" 
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
          style={{ 
            border: 'none',
            transition: 'all 0.3s ease',
            background: isDarkMode ? '#141414' : '#f8f9fa'
          }}
        />
      </Drawer>

      <Layout>
        <Header style={{ 
          background: isDarkMode ? '#1F1F1F' : '#FFFFFF', 
          padding: '0 24px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
          borderBottom: isDarkMode ? 'none' : '1px solid #D9D9D9',
          transition: 'all 0.3s ease'
        }}>
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="mobile-menu-btn"
            style={{ 
              fontSize: '16px',
              width: 40,
              height: 40,
              display: 'none'
            }}
          />

          {/* Header Title */}
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: 18,
            color: isDarkMode ? '#FFFFFFD9' : '#1f1f1f',
            flex: 1,
            textAlign: 'center',
            transition: 'color 0.3s ease'
          }}>
            DevInsight - AI-Powered Repository Analyzer
          </div>

          {/* Theme Toggle */}
          <Space size="middle">
            <Space align="center">
              {isDarkMode ? (
                <BulbFilled style={{ color: '#faad14', fontSize: '16px' }} />
              ) : (
                <BulbOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />
              )}
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                checkedChildren="🌙"
                unCheckedChildren="☀️"
                style={{ backgroundColor: isDarkMode ? '#1890ff' : '#d9d9d9' }}
              />
            </Space>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '0', 
          overflow: 'initial',
          backgroundColor: isDarkMode ? '#141414' : '#F0F2F5',
          transition: 'background-color 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<AnalyzeRepo />} />
          </Routes>
        </Content>
      </Layout>

      <style jsx>{`
        @media (min-width: 992px) {
          .desktop-sider {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        
        @media (max-width: 991px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
