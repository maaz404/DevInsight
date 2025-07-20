
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
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 18, 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <GithubOutlined style={{ marginRight: 8 }} />
        DevInsight
      </div>
      <Menu 
        theme="dark" 
        mode="inline" 
        selectedKeys={getSelectedKey()}
        items={menuItems}
        onClick={() => setDrawerVisible(false)}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        style={{ display: 'none' }}
        className="desktop-sider"
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <GithubOutlined />
            DevInsight
          </Space>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0, backgroundColor: '#001529' }}
        width={280}
        className="mobile-drawer"
      >
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Layout>
        <Header style={{ 
          background: isDarkMode ? '#141414' : '#fff', 
          padding: '0 24px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
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
            color: isDarkMode ? '#fff' : '#000',
            flex: 1,
            textAlign: 'center'
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
          backgroundColor: isDarkMode ? '#000000' : '#f5f5f5'
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
