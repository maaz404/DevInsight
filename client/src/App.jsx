
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  GithubOutlined,
  BarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Home from './pages/Home';
import AnalyzeRepo from './pages/AnalyzeRepo';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const location = useLocation();
  
  const getSelectedKey = () => {
    if (location.pathname === '/analyze') return ['2'];
    return ['1'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ 
          height: 32, 
          margin: 16, 
          color: '#fff', 
          fontWeight: 'bold', 
          fontSize: 20, 
          textAlign: 'center' 
        }}>
          <GithubOutlined style={{ marginRight: 8 }} />DevInsight
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={getSelectedKey()}>
          <Menu.Item key="1" icon={<BarChartOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<SearchOutlined />}>
            <Link to="/analyze">Analyze Repo</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: 0, 
          fontWeight: 'bold', 
          fontSize: 18, 
          textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          DevInsight - AI-Powered Repository Analyzer
        </Header>
        <Content style={{ margin: '0', overflow: 'initial' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<AnalyzeRepo />} />
          </Routes>
        </Content>
      </Layout>
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
