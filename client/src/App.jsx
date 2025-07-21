
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Switch, Space, Button, Drawer, Grid, ConfigProvider, Typography, Row, Col } from 'antd';
import {
  GithubOutlined,
  BarChartOutlined,
  SearchOutlined,
  BulbOutlined,
  BulbFilled,
  MenuOutlined,
} from '@ant-design/icons';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import Home from './pages/Home';
import AnalyzeRepo from './pages/AnalyzeRepo';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const location = useLocation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const breakpoint = Grid.useBreakpoint();
  
  // Mobile detection - screens smaller than 'md' (768px)
  const isMobile = !breakpoint.md;
  
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

  // Mobile-optimized sidebar content
  const SidebarContent = ({ closeSidebar = null }) => (
    <>
      <div style={{ 
        height: isMobile ? 56 : 64, 
        margin: isMobile ? '12px' : '16px', 
        color: isDarkMode ? '#FFFFFFD9' : '#3a6ea5', 
        fontWeight: 'bold', 
        fontSize: isMobile ? 16 : 18, 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}>
        <GithubOutlined style={{ marginRight: isMobile ? 6 : 8 }} />
        DevInsight
      </div>
      <Menu 
        theme={isDarkMode ? "dark" : "light"} 
        mode="inline" 
        selectedKeys={getSelectedKey()}
        items={menuItems}
        onClick={() => {
          if (closeSidebar) closeSidebar();
        }}
        style={{
          border: 'none',
          transition: 'all 0.3s ease',
          background: isDarkMode ? '#141414' : '#dde3ea'
        }}
      />
    </>
  );

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#000000' : '#f4f6f8' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={250}
          style={{
            background: isDarkMode ? '#141414' : '#dde3ea',
            borderRight: `1px solid ${isDarkMode ? '#303030' : '#c7d2dd'}`,
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space style={{ color: isDarkMode ? '#FFFFFFD9' : '#1e1e1e' }}>
            <GithubOutlined />
            DevInsight
          </Space>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ 
          padding: 0,
          background: isDarkMode ? '#141414' : '#dde3ea'
        }}
      >
        <SidebarContent closeSidebar={() => setDrawerVisible(false)} />
      </Drawer>

      <Layout style={{ 
        marginLeft: isMobile ? 0 : 250, 
        background: isDarkMode ? '#000000' : '#f4f6f8',
        transition: 'margin-left 0.3s ease' 
      }}>
        {/* Responsive Header */}
        <Header style={{
          background: isDarkMode ? '#1f1f1f' : '#ffffff',
          padding: isMobile ? '0 12px' : '0 24px',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e0e6ec'}`,
          position: 'sticky',
          top: 0,
          zIndex: 999,
          height: isMobile ? 56 : 64,
          transition: 'all 0.3s ease'
        }}>
          <Row align="middle" justify="space-between" style={{ width: '100%', height: '100%' }}>
            <Col flex="auto">
              <Row align="middle" gutter={12}>
                {isMobile && (
                  <Col>
                    <Button
                      type="text"
                      icon={<MenuOutlined />}
                      onClick={() => setDrawerVisible(true)}
                      style={{
                        fontSize: '16px',
                        color: isDarkMode ? '#FFFFFFD9' : '#3a6ea5',
                        border: 'none'
                      }}
                    />
                  </Col>
                )}
                <Col>
                  <Title 
                    level={isMobile ? 5 : 4} 
                    style={{ 
                      margin: 0, 
                      color: isDarkMode ? '#FFFFFFD9' : '#3a6ea5',
                      fontSize: isMobile ? '14px' : '18px',
                      fontWeight: 600
                    }}
                  >
                    DevInsight - AI Repository Analyzer
                  </Title>
                </Col>
              </Row>
            </Col>
            <Col>
              <Space size="middle">
                <Space align="center">
                  {isDarkMode ? (
                    <BulbFilled style={{ color: '#faad14', fontSize: isMobile ? '14px' : '16px' }} />
                  ) : (
                    <BulbOutlined style={{ color: '#8c8c8c', fontSize: isMobile ? '14px' : '16px' }} />
                  )}
                  <Switch
                    checked={isDarkMode}
                    onChange={toggleTheme}
                    size={isMobile ? "small" : "default"}
                    checkedChildren="🌙"
                    unCheckedChildren="☀️"
                    style={{ backgroundColor: isDarkMode ? '#1890ff' : '#d9d9d9' }}
                  />
                </Space>
              </Space>
            </Col>
          </Row>
        </Header>

        {/* Responsive Content */}
        <Content style={{
          margin: isMobile ? '12px' : '24px',
          padding: isMobile ? '16px' : '24px',
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px',
          minHeight: 280,
          boxShadow: isDarkMode 
            ? '0 1px 3px rgba(255, 255, 255, 0.1)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<AnalyzeRepo />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;
