import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Spin, Row, Col, Statistic, Progress, Tag, List, Divider, Collapse, Badge, Space, Tooltip } from 'antd';
import { 
  BugOutlined, 
  CodeOutlined, 
  AlertOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  FunctionOutlined,
  FileTextOutlined,
  RadarChartOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { Grid } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const CodeSmellScanner = ({ onAnalyze, analysis, loading: propLoading }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(analysis || null);
  const [error, setError] = useState(null);
  const screens = useBreakpoint();

  // Update result when analysis prop changes
  React.useEffect(() => {
    if (analysis) {
      setResult(analysis);
    }
  }, [analysis]);

  const isLoading = loading || propLoading;

  const handleAnalyze = async (repoUrl) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/code-smells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        if (onAnalyze) {
          onAnalyze(data.data);
        }
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Code smell analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      CRITICAL: '#ff4d4f',
      HIGH: '#ff7a45',
      MEDIUM: '#fa8c16',
      WARNING: '#fadb14',
      SAFE: '#52c41a'
    };
    return colors[riskLevel] || '#d9d9d9';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      CRITICAL: <AlertOutlined style={{ color: '#ff4d4f' }} />,
      HIGH: <ExclamationCircleOutlined style={{ color: '#ff7a45' }} />,
      MEDIUM: <WarningOutlined style={{ color: '#fa8c16' }} />,
      LOW: <BugOutlined style={{ color: '#fadb14' }} />,
      WARNING: <BugOutlined style={{ color: '#fadb14' }} />
    };
    return icons[severity] || <BugOutlined />;
  };

  const renderOverviewCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Overall Score"
            value={result.overallScore}
            suffix="/ 100"
            valueStyle={{ 
              color: result.overallScore > 70 ? '#52c41a' : 
                     result.overallScore > 50 ? '#fa8c16' : '#ff4d4f' 
            }}
            prefix={<RadarChartOutlined />}
          />
          <Progress 
            percent={result.overallScore} 
            size="small" 
            strokeColor={
              result.overallScore > 70 ? '#52c41a' : 
              result.overallScore > 50 ? '#fa8c16' : '#ff4d4f'
            }
            showInfo={false}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Files Analyzed"
            value={result.analyzedFiles}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Functions Found"
            value={result.totalFunctions}
            prefix={<FunctionOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Issues Detected"
            value={result.totalIssues}
            prefix={<BugOutlined />}
            valueStyle={{ color: result.totalIssues > 10 ? '#ff4d4f' : '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderRiskDistribution = () => (
    <Card title={
      <Space>
        <ThunderboltOutlined />
        <span>Risk Distribution</span>
      </Space>
    } style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {Object.entries(result.riskDistribution).map(([level, count]) => (
          <Col xs={24} sm={12} md={4} lg={4} key={level}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: getRiskColor(level),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {count}
              </div>
              <Text strong style={{ color: getRiskColor(level) }}>
                {level}
              </Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const renderTopIssues = () => (
    <Card 
      title={
        <Space>
          <AlertOutlined />
          <span>Critical & High Priority Issues</span>
          <Badge count={result.topIssues.length} style={{ backgroundColor: '#ff4d4f' }} />
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      {result.topIssues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4} style={{ color: '#52c41a' }}>No Critical Issues Found!</Title>
          <Text type="secondary">Your code quality looks good.</Text>
        </div>
      ) : (
        <List
          dataSource={result.topIssues}
          renderItem={(issue, index) => (
            <List.Item key={index}>
              <List.Item.Meta
                avatar={getSeverityIcon(issue.severity)}
                title={
                  <Space>
                    <Tag color={getRiskColor(issue.severity)}>{issue.severity}</Tag>
                    <Text strong>{issue.message}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">File: {issue.file}</Text>
                    <br />
                    <Text>{issue.suggestion}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const renderWorstFiles = () => (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>Files Needing Attention</span>
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <List
        dataSource={result.worstFiles}
        renderItem={(file, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{file.path}</Text>
                  <Tag color={file.score > 70 ? 'green' : file.score > 50 ? 'orange' : 'red'}>
                    Score: {file.score}/100
                  </Tag>
                </Space>
              }
              description={
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary">{file.issues} issues</Text>
                  <Text type="secondary">{file.functions} functions</Text>
                </Space>
              }
            />
            <Progress 
              percent={file.score} 
              size="small" 
              strokeColor={file.score > 70 ? '#52c41a' : file.score > 50 ? '#fa8c16' : '#ff4d4f'}
              style={{ width: screens.xs ? 100 : 150 }}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderRecommendations = () => (
    <Card 
      title={
        <Space>
          <BulbOutlined />
          <span>Improvement Recommendations</span>
        </Space>
      }
    >
      <List
        dataSource={result.recommendations}
        renderItem={(rec, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={
                <Tag color={
                  rec.priority === 'critical' ? 'red' :
                  rec.priority === 'high' ? 'orange' :
                  rec.priority === 'medium' ? 'blue' : 'green'
                }>
                  {rec.priority.toUpperCase()}
                </Tag>
              }
              title={rec.message}
              description={rec.suggestion}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderDetailedFiles = () => (
    <Card title="Detailed File Analysis" style={{ marginTop: 16 }}>
      <Collapse>
        {result.files.map((file, index) => (
          <Panel 
            key={index}
            header={
              <Space>
                <span>{file.filePath}</span>
                <Tag color={file.score > 70 ? 'green' : file.score > 50 ? 'orange' : 'red'}>
                  {file.score}/100
                </Tag>
                <Badge count={file.issues.length} style={{ backgroundColor: '#ff4d4f' }} />
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary">{file.language}</Text>
                <Text type="secondary">{file.functions.length} functions</Text>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Title level={5}>File Metrics</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Lines: {file.lineCount}</Text>
                  <Text>Code Lines: {file.metrics.codeLines}</Text>
                  <Text>Comment Lines: {file.metrics.commentLines}</Text>
                  <Text>Comment Ratio: {(file.metrics.commentRatio * 100).toFixed(1)}%</Text>
                </Space>
              </Col>
              
              <Col xs={24} md={12}>
                <Title level={5}>Functions</Title>
                <List
                  size="small"
                  dataSource={file.functions.slice(0, 5)}
                  renderItem={func => (
                    <List.Item>
                      <Space>
                        <Text strong>{func.name}</Text>
                        <Tag color={getRiskColor(func.riskLevel)}>
                          {func.riskLevel}
                        </Tag>
                        <Text type="secondary">
                          {func.length} lines, complexity: {func.complexity}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
                {file.functions.length > 5 && (
                  <Text type="secondary">
                    ... and {file.functions.length - 5} more functions
                  </Text>
                )}
              </Col>
            </Row>
            
            {file.issues.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Issues</Title>
                <List
                  size="small"
                  dataSource={file.issues}
                  renderItem={issue => (
                    <List.Item>
                      <Space>
                        {getSeverityIcon(issue.severity)}
                        <Text>{issue.message}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </>
            )}
          </Panel>
        ))}
      </Collapse>
    </Card>
  );

  return (
    <div style={{ padding: screens.xs ? 8 : 16 }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <CodeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={2}>Code Smell Scanner</Title>
        <Paragraph type="secondary">
          Analyze your code for complexity issues, code smells, and quality problems
        </Paragraph>
      </div>

      {isLoading && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Analyzing Code Quality...
          </Title>
          <Text type="secondary">
            Scanning functions, detecting complexity patterns, and identifying code smells
          </Text>
        </Card>
      )}

      {error && (
        <Alert
          message="Analysis Failed"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {result && !isLoading && (
        <div>
          {renderOverviewCards()}
          {renderRiskDistribution()}
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderTopIssues()}
            </Col>
            <Col xs={24} lg={12}>
              {renderWorstFiles()}
            </Col>
          </Row>
          
          {renderRecommendations()}
          {renderDetailedFiles()}
        </div>
      )}

      {!result && !isLoading && !error && (
        <Card style={{ textAlign: 'center' }}>
          <BugOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">Ready to Scan Code Quality</Title>
          <Text type="secondary">
            Enter a GitHub repository URL above to analyze code complexity and detect potential issues
          </Text>
        </Card>
      )}
    </div>
  );
};

export default CodeSmellScanner;
