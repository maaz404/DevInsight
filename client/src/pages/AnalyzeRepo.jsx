import React, { useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Alert, 
  Spin, 
  Typography, 
  Row, 
  Col,
  Statistic,
  Tag,
  Progress,
  List,
  Divider,
  Space,
  Badge
} from 'antd';
import { 
  GithubOutlined, 
  SearchOutlined, 
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  BugOutlined,
  CodeOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const AnalyzeRepo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      setResults(null);
      
      console.log('Submitting analysis for:', values.repoUrl);
      
      const response = await axios.post('/api/analyze', {
        repoUrl: values.repoUrl.trim()
      });
      
      console.log('Analysis response:', response.data);
      setResults(response.data);
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to analyze repository. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a'; // green
    if (score >= 60) return '#faad14'; // orange
    return '#ff4d4f'; // red
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'active';
    return 'exception';
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <GithubOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Analyze GitHub Repository
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          Get AI-powered insights into code quality, structure, and best practices
        </Paragraph>
      </div>

      {/* Input Form */}
      <Card style={{ marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label="GitHub Repository URL"
            name="repoUrl"
            rules={[
              { required: true, message: 'Please enter a GitHub repository URL' },
              { 
                pattern: /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/,
                message: 'Please enter a valid GitHub repository URL'
              }
            ]}
          >
            <Input
              prefix={<GithubOutlined />}
              placeholder="https://github.com/username/repository"
              onChange={() => setError('')}
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={loading ? <LoadingOutlined /> : <SearchOutlined />}
              block
              style={{ height: 48 }}
            >
              {loading ? 'Analyzing Repository...' : 'Analyze Repository'}
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
          <Text type="secondary">
            Enter the complete GitHub repository URL (e.g., https://github.com/facebook/react)
          </Text>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
            Analyzing Repository...
          </Title>
          <Paragraph type="secondary">
            Our AI is examining your code. This may take a few moments.
          </Paragraph>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert
          message="Analysis Failed"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button 
              size="small" 
              danger 
              onClick={() => setError('')}
            >
              Dismiss
            </Button>
          }
        />
      )}

      {/* Results */}
      {results && results.success && (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Repository Information */}
          <Card 
            title={
              <Space>
                <GithubOutlined />
                Repository Information
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Repository" 
                  value={`${results.repositoryInfo?.owner}/${results.repositoryInfo?.repo}` || 'N/A'}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Analysis Date" 
                  value={new Date().toLocaleDateString()}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Files Analyzed" 
                  value={results.repositoryInfo?.totalFiles || 0}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Code Files" 
                  value={results.repositoryInfo?.codeFiles || 0}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Card>

          {/* AI Analysis Results */}
          {results.aiAnalysis && (
            <Card 
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  AI Analysis Results
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {/* Overall Readiness Score */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={3} style={{ marginBottom: 16 }}>Overall Readiness Score</Title>
                <Progress
                  type="circle"
                  percent={results.aiAnalysis.readinessScore || 0}
                  size={120}
                  strokeColor={getScoreColor(results.aiAnalysis.readinessScore || 0)}
                  format={(percent) => `${percent}%`}
                />
                <div style={{ marginTop: 16 }}>
                  <Badge 
                    status={getScoreStatus(results.aiAnalysis.readinessScore || 0)}
                    text={
                      results.aiAnalysis.readinessScore >= 80 ? 'Excellent' :
                      results.aiAnalysis.readinessScore >= 60 ? 'Good' : 'Needs Improvement'
                    }
                  />
                </div>
              </div>

              {/* Code Quality */}
              {results.aiAnalysis.codeQuality && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <CodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Code Quality Assessment
                  </Title>
                  
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Progress
                        percent={results.aiAnalysis.codeQuality.score || 0}
                        strokeColor={getScoreColor(results.aiAnalysis.codeQuality.score || 0)}
                        status={getScoreStatus(results.aiAnalysis.codeQuality.score || 0)}
                      />
                    </Col>
                  </Row>
                  
                  {results.aiAnalysis.codeQuality.comments && results.aiAnalysis.codeQuality.comments.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5}>💬 Comments</Title>
                      <List
                        size="small"
                        dataSource={results.aiAnalysis.codeQuality.comments}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                  
                  {results.aiAnalysis.codeQuality.strengths && results.aiAnalysis.codeQuality.strengths.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Strengths
                      </Title>
                      <List
                        size="small"
                        dataSource={results.aiAnalysis.codeQuality.strengths}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Tag color="green">{item}</Tag>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                  
                  {results.aiAnalysis.codeQuality.improvements && results.aiAnalysis.codeQuality.improvements.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5}>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        Suggested Improvements
                      </Title>
                      <List
                        size="small"
                        dataSource={results.aiAnalysis.codeQuality.improvements}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Tag color="orange">{item}</Tag>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* README Quality */}
              {results.aiAnalysis.readmeQuality && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={4}>📖 README Analysis</Title>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Badge 
                        status={results.aiAnalysis.readmeQuality.exists ? 'success' : 'error'}
                        text={results.aiAnalysis.readmeQuality.exists ? 'README Found' : 'No README'}
                      />
                    </Col>
                    {results.aiAnalysis.readmeQuality.score && (
                      <Col span={12}>
                        <Progress
                          percent={results.aiAnalysis.readmeQuality.score}
                          strokeColor={getScoreColor(results.aiAnalysis.readmeQuality.score)}
                          status={getScoreStatus(results.aiAnalysis.readmeQuality.score)}
                        />
                      </Col>
                    )}
                  </Row>
                  {results.aiAnalysis.readmeQuality.feedback && (
                    <Alert
                      message="README Feedback"
                      description={results.aiAnalysis.readmeQuality.feedback}
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              )}

              {/* Overall Summary */}
              {results.aiAnalysis.overallSummary && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={4}>📋 Overall Summary</Title>
                  <Alert
                    message="Analysis Summary"
                    description={results.aiAnalysis.overallSummary}
                    type="info"
                    showIcon
                  />
                </div>
              )}
            </Card>
          )}

          {/* Analysis Details */}
          <Card 
            title="Analysis Details"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Processing Time" 
                  value={results.processingTime || 'N/A'}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Analysis ID" 
                  value={results.databaseId || 'Not saved'}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Database Status" 
                  value={results.savedToDatabase ? 'Saved' : 'Not saved'}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="Analysis Type" 
                  value="AI-Powered Analysis"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyzeRepo;
