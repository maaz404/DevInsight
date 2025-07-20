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
  Badge,
  Tooltip,
  message,
  Steps,
  Result,
  Skeleton,
  Tabs,
  Empty
} from 'antd';
import { 
  GithubOutlined, 
  SearchOutlined, 
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  BookOutlined,
  ToolOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '../theme/ThemeProvider';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const AnalyzeRepo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);
  const { isDarkMode } = useTheme();

  const analysisSteps = [
    { title: 'Repository Access', description: 'Fetching repository data...' },
    { title: 'Code Analysis', description: 'Analyzing code quality and structure...' },
    { title: 'Documentation Check', description: 'Reviewing documentation quality...' },
    { title: 'Generating Report', description: 'Compiling AI-powered insights...' }
  ];

  const handleSubmit = async (values) => {
    // Validate GitHub URL format more thoroughly
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    if (!githubUrlPattern.test(values.repoUrl.trim())) {
      message.error('Please enter a valid GitHub repository URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResults(null);
      setAnalysisStep(0);
      
      console.log('Submitting analysis for:', values.repoUrl);
      
      // Simulate analysis steps progression
      const stepInterval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev < 3) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 1500);
      
      const response = await axios.post('/api/analyze', {
        repoUrl: values.repoUrl.trim()
      });
      
      clearInterval(stepInterval);
      setAnalysisStep(4);
      console.log('Analysis response:', response.data);
      setResults(response.data);
      message.success('Repository analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to analyze repository. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setAnalysisStep(0);
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

  const detectLanguages = (repositoryInfo) => {
    // Mock language detection - in real app this would come from API
    const languages = ['JavaScript', 'React', 'Node.js', 'CSS'];
    return languages;
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: isDarkMode ? '#000000' : '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ color: isDarkMode ? '#fff' : '#000' }}>
          <GithubOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Analyze GitHub Repository
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          Get AI-powered insights into code quality, structure, and best practices
        </Paragraph>
      </div>

      {/* Input Form */}
      <Card 
        style={{ 
          marginBottom: 24, 
          maxWidth: 800, 
          margin: '0 auto 24px',
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label={
              <Space>
                GitHub Repository URL
                <Tooltip title="Enter the complete GitHub repository URL (e.g., https://github.com/facebook/react)">
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
            name="repoUrl"
            rules={[
              { required: true, message: 'Please enter a GitHub repository URL' },
              { 
                pattern: /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/,
                message: 'Please enter a valid GitHub repository URL (https://github.com/owner/repo)'
              }
            ]}
          >
            <Input
              prefix={<GithubOutlined style={{ color: '#1890ff' }} />}
              placeholder="https://github.com/username/repository"
              onChange={() => setError('')}
              style={{ fontSize: '16px' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={loading ? <LoadingOutlined /> : <SearchOutlined />}
              block
              style={{ height: 48, fontSize: '16px' }}
            >
              {loading ? 'Analyzing Repository...' : 'Analyze Repository'}
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
          <Text type="secondary">
            📊 Get comprehensive code quality insights, documentation analysis, and improvement suggestions
          </Text>
        </div>
      </Card>

      {/* Loading State with Steps */}
      {loading && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16, marginBottom: 24 }}>
            Analyzing Repository...
          </Title>
          <Steps 
            current={analysisStep} 
            size="small"
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            {analysisSteps.map((step, index) => (
              <Step 
                key={index}
                title={step.title} 
                description={step.description}
              />
            ))}
          </Steps>
          <Paragraph type="secondary" style={{ marginTop: 16 }}>
            Our AI is examining your code. This may take a few moments.
          </Paragraph>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Result
          status="error"
          title="Analysis Failed"
          subTitle={error}
          extra={[
            <Button 
              type="primary" 
              key="retry"
              onClick={() => setError('')}
            >
              Try Again
            </Button>
          ]}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Empty State */}
      {!loading && !error && !results && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Enter a GitHub repository URL above to get started with AI-powered analysis
              </span>
            }
          />
        </Card>
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
            extra={
              <Space>
                {detectLanguages(results.repositoryInfo).map(lang => (
                  <Tag key={lang} color="blue">{lang}</Tag>
                ))}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
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

              {/* Tabbed Analysis Sections */}
              <Tabs
                defaultActiveKey="code"
                items={[
                  {
                    key: 'code',
                    label: (
                      <Space>
                        <CodeOutlined />
                        Code Quality
                      </Space>
                    ),
                    children: results.aiAnalysis.codeQuality ? (
                      <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={12}>
                            <Statistic
                              title="Code Quality Score"
                              value={results.aiAnalysis.codeQuality.score || 0}
                              suffix="/ 100"
                              valueStyle={{ color: getScoreColor(results.aiAnalysis.codeQuality.score || 0) }}
                            />
                          </Col>
                          <Col span={12}>
                            <Progress
                              percent={results.aiAnalysis.codeQuality.score || 0}
                              strokeColor={getScoreColor(results.aiAnalysis.codeQuality.score || 0)}
                              status={getScoreStatus(results.aiAnalysis.codeQuality.score || 0)}
                            />
                          </Col>
                        </Row>
                        
                        {results.aiAnalysis.codeQuality.strengths && results.aiAnalysis.codeQuality.strengths.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <Title level={5}>
                              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                              Strengths
                            </Title>
                            <List
                              size="small"
                              dataSource={results.aiAnalysis.codeQuality.strengths}
                              renderItem={(item) => (
                                <List.Item>
                                  <Tag color="green">{item}</Tag>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}
                        
                        {results.aiAnalysis.codeQuality.improvements && results.aiAnalysis.codeQuality.improvements.length > 0 && (
                          <div>
                            <Title level={5}>
                              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                              Suggested Improvements
                            </Title>
                            <List
                              size="small"
                              dataSource={results.aiAnalysis.codeQuality.improvements}
                              renderItem={(item) => (
                                <List.Item>
                                  <Tag color="orange">{item}</Tag>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <Empty description="No code quality data available" />
                    )
                  },
                  {
                    key: 'docs',
                    label: (
                      <Space>
                        <BookOutlined />
                        Documentation
                      </Space>
                    ),
                    children: results.aiAnalysis.readmeQuality ? (
                      <div>
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
                            message="Documentation Feedback"
                            description={results.aiAnalysis.readmeQuality.feedback}
                            type="info"
                            showIcon
                          />
                        )}
                      </div>
                    ) : (
                      <Empty description="No documentation data available" />
                    )
                  },
                  {
                    key: 'practices',
                    label: (
                      <Space>
                        <ToolOutlined />
                        Best Practices
                      </Space>
                    ),
                    children: (
                      <div>
                        {results.aiAnalysis.overallSummary ? (
                          <Alert
                            message="Best Practices Analysis"
                            description={results.aiAnalysis.overallSummary}
                            type="info"
                            showIcon
                          />
                        ) : (
                          <Empty description="No best practices data available" />
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          )}

          {/* Analysis Details */}
          <Card 
            title="Analysis Details"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
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
