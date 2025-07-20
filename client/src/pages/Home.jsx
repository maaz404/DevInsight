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
  
  // Enhanced conditional styling helper function with improved visual structure
  const getContainerStyle = (additionalStyles = {}) => ({
    border: isDarkMode ? 'none' : '1px solid #C9CED6', // Visible borders for structure
    boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)', // Enhanced shadows
    transition: 'all 0.3s ease',
    background: isDarkMode ? '#1F1F1F' : '#FAFAFA', // Raised container background
    ...additionalStyles
  });
  
  return (
    <div style={{ 
      padding: '0 24px', 
      background: isDarkMode ? '#141414' : '#EEF1F5', // Darker muted base background
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 0',
        ...getContainerStyle({
          margin: '0 auto 40px',
          maxWidth: '1200px',
          borderRadius: '8px',
          marginTop: '24px'
        })
      }}>
        <Title 
          level={1} 
          style={{ 
            fontSize: '48px', 
            marginBottom: 16,
            color: isDarkMode ? '#FFFFFFD9' : '#1C1C1C', // Enhanced text contrast
            transition: 'color 0.3s ease'
          }}
        >
          <GithubOutlined style={{ marginRight: 16, color: isDarkMode ? '#4096FF' : '#1677FF' }} />
          DevInsight
        </Title>
        <Title level={2} style={{ 
          fontWeight: 400, 
          marginBottom: 24,
          color: isDarkMode ? '#FFFFFFA6' : '#5A5A5A' // Improved secondary text contrast
        }}>
          AI-Powered GitHub Repository Analyzer
        </Title>
        <Divider style={{ width: 100, margin: '0 auto 40px' }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Paragraph style={{ 
            fontSize: '18px', 
            marginBottom: 32,
            color: isDarkMode ? '#FFFFFFA6' : '#5A5A5A' // Consistent secondary text
          }}>
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
            style={{ 
              textAlign: 'center', 
              height: '100%',
              ...getContainerStyle()
            }}
            bodyStyle={{ padding: 32 }}
          >
            <div style={{ 
              width: 64, 
              height: 64, 
              background: isDarkMode ? 'rgba(64, 150, 255, 0.1)' : '#E6F4FF', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px',
              transition: 'background-color 0.3s ease'
            }}>
              <CodeOutlined style={{ fontSize: 32, color: isDarkMode ? '#4096FF' : '#1677FF' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Code Quality Analysis</Title>
            <Paragraph style={{ 
              color: isDarkMode ? '#FFFFFFA6' : '#000000A6'
            }}>
              Comprehensive analysis of code quality metrics, best practices, and potential improvements 
              using cutting-edge AI technology.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ 
              textAlign: 'center', 
              height: '100%',
              ...getContainerStyle()
            }}
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
              margin: '0 auto 16px',
              transition: 'background-color 0.3s ease'
            }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Performance Insights</Title>
            <Paragraph style={{ 
              color: isDarkMode ? '#FFFFFFA6' : '#000000A6'
            }}>
              Identify performance bottlenecks and get AI-powered suggestions for optimization 
              to enhance your application's efficiency.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ 
              textAlign: 'center', 
              height: '100%',
              ...getContainerStyle()
            }}
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
              margin: '0 auto 16px',
              transition: 'background-color 0.3s ease'
            }}>
              <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            </div>
            <Title level={4} style={{ marginBottom: 16 }}>Team Collaboration</Title>
            <Paragraph style={{ 
              color: isDarkMode ? '#FFFFFFA6' : '#000000A6'
            }}>
              Analyze collaboration patterns, contribution metrics, and team productivity insights 
              to improve development workflows.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Card style={{ 
        textAlign: 'center', 
        marginBottom: 40,
        ...getContainerStyle()
      }}>
        <Title level={3} style={{ marginBottom: 16 }}>Ready to Analyze Your Repository?</Title>
        <Paragraph style={{ 
          fontSize: '16px', 
          marginBottom: 24,
          color: isDarkMode ? '#FFFFFFA6' : '#000000A6'
        }}>
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
      <div style={{ 
        textAlign: 'center', 
        padding: '20px 0', 
        color: isDarkMode ? '#FFFFFF73' : '#00000073',
        ...getContainerStyle({
          borderRadius: '8px'
        })
      }}>
        <Paragraph style={{ 
          color: isDarkMode ? '#FFFFFF73' : '#00000073',
          margin: 0
        }}>
          © 2025 DevInsight. Built with React, Node.js, and AI. Powered by Ant Design.
        </Paragraph>
      </div>
    </div>
  )
}

export default Home;
