import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Space, Divider } from 'antd';
import { 
  CodeOutlined, 
  ThunderboltOutlined, 
  TeamOutlined,
  SearchOutlined,
  GithubOutlined 
} from '@ant-design/icons';
import { useTheme } from '../theme/ThemeProvider';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{ 
      padding: '0 24px', 
      background: isDarkMode ? '#000000' : '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title 
          level={1} 
          style={{ 
            fontSize: '48px', 
            marginBottom: 16,
            color: isDarkMode ? '#fff' : '#000'
          }}
        >
          <GithubOutlined style={{ marginRight: 16, color: '#1890ff' }} />
          DevInsight
        </Title>
        <Title level={2} type="secondary" style={{ fontWeight: 400, marginBottom: 24 }}>
          AI-Powered GitHub Repository Analyzer
        </Title>
        <Divider style={{ width: 100, margin: '0 auto 40px' }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Paragraph style={{ fontSize: '18px', marginBottom: 32 }}>
            Unlock comprehensive insights from your GitHub repositories with advanced AI algorithms. 
            Perfect for developers, teams, and project managers seeking to improve code quality and productivity.
          </Paragraph>
          
          <Link to="/analyze">
            <Button 
              type="primary" 
              size="large" 
              icon={<SearchOutlined />}
              style={{ height: 50, fontSize: '16px', paddingLeft: 32, paddingRight: 32 }}
            >
              Start Analyzing
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 60 }}>
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            bodyStyle={{ padding: 32 }}
          >
            <div style={{ 
              width: 64, 
              height: 64, 
              background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : '#e6f7ff', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CodeOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Code Quality Analysis</Title>
            <Paragraph type="secondary">
              Comprehensive analysis of code quality metrics, best practices, and potential improvements 
              using cutting-edge AI technology.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            bodyStyle={{ padding: 32 }}
          >
            <div style={{ 
              width: 64, 
              height: 64, 
              background: isDarkMode ? 'rgba(250, 140, 22, 0.1)' : '#fff7e6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Performance Insights</Title>
            <Paragraph type="secondary">
              Identify performance bottlenecks and get AI-powered suggestions for optimization 
              to enhance your application's efficiency.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            bodyStyle={{ padding: 32 }}
          >
            <div style={{ 
              width: 64, 
              height: 64, 
              background: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : '#f6ffed', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Team Collaboration</Title>
            <Paragraph type="secondary">
              Analyze collaboration patterns, contribution metrics, and team productivity insights 
              to improve development workflows.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Card style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={3} style={{ marginBottom: 16 }}>Ready to Analyze Your Repository?</Title>
        <Paragraph style={{ fontSize: '16px', marginBottom: 24 }}>
          Get detailed insights into your codebase with our AI-powered analysis engine.
        </Paragraph>
        <Space>
          <Link to="/analyze">
            <Button type="primary" size="large" icon={<SearchOutlined />}>
              Analyze Now
            </Button>
          </Link>
          <Button size="large" href="https://github.com/maaz404/DevInsight" target="_blank">
            <GithubOutlined /> View on GitHub
          </Button>
        </Space>
      </Card>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
        <Paragraph type="secondary">
          © 2025 DevInsight. Built with React, Node.js, and AI. Powered by Ant Design.
        </Paragraph>
      </div>
    </div>
  )
}

export default Home;
