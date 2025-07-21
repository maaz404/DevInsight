import React, { useState } from 'react';
import { Card, Typography, Alert, Spin, Row, Col, Statistic, Progress, Tag, List, Divider, Space, Tooltip, Badge, Avatar } from 'antd';
import { 
  StarOutlined, 
  ForkOutlined, 
  EyeOutlined,
  IssuesCloseOutlined,
  GitlabOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  CodeOutlined,
  BranchesOutlined,
  BookOutlined,
  SafetyOutlined,
  RiseOutlined,
  FallOutlined,
  LineOutlined,
  UserOutlined,
  BugOutlined
} from '@ant-design/icons';
import { Grid } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const GitHubApiAnalyzer = ({ onAnalyze, analysis, loading: propLoading }) => {
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
      const response = await fetch('/api/analyze/github/github', {
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
      console.error('GitHub API analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#1890ff';
    if (score >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getLevelColor = (level) => {
    const colors = {
      EXCELLENT: '#52c41a',
      GOOD: '#1890ff',
      AVERAGE: '#fa8c16',
      POOR: '#ff7a45',
      VERY_POOR: '#ff4d4f'
    };
    return colors[level] || '#d9d9d9';
  };

  const getActivityIcon = (trend) => {
    if (trend === 'increasing') return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (trend === 'decreasing') return <FallOutlined style={{ color: '#ff4d4f' }} />;
    return <LineOutlined style={{ color: '#fa8c16' }} />;
  };

  const renderOverviewCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Overall Score"
            value={result.score}
            suffix="/ 100"
            valueStyle={{ color: getScoreColor(result.score) }}
            prefix={<TrophyOutlined />}
          />
          <Progress 
            percent={result.score} 
            size="small" 
            strokeColor={getScoreColor(result.score)}
            showInfo={false}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Stars"
            value={result.popularity?.stars?.count || 0}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#fadb14' }}
          />
          <Tag color={getLevelColor(result.popularity?.stars?.level)}>
            {result.popularity?.stars?.level || 'N/A'}
          </Tag>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Contributors"
            value={result.community?.contributors?.total || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size={screens.xs ? "small" : "default"}>
          <Statistic
            title="Activity"
            value={result.activity?.overallScore || 0}
            suffix="/100"
            prefix={<FireOutlined />}
            valueStyle={{ color: getScoreColor(result.activity?.overallScore || 0) }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderPopularityMetrics = () => (
    <Card 
      title={
        <Space>
          <StarOutlined />
          <span>Popularity Metrics</span>
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Avatar size={64} style={{ backgroundColor: '#fadb14', marginBottom: 8 }}>
              <StarOutlined style={{ fontSize: 24 }} />
            </Avatar>
            <Title level={4}>{result.popularity?.stars?.count || 0}</Title>
            <Text type="secondary">Stars</Text>
            <br />
            <Tag color={getLevelColor(result.popularity?.stars?.level)}>
              {result.popularity?.stars?.level}
            </Tag>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Avatar size={64} style={{ backgroundColor: '#1890ff', marginBottom: 8 }}>
              <ForkOutlined style={{ fontSize: 24 }} />
            </Avatar>
            <Title level={4}>{result.popularity?.forks?.count || 0}</Title>
            <Text type="secondary">Forks</Text>
            <br />
            <Tag color={getLevelColor(result.popularity?.forks?.level)}>
              {result.popularity?.forks?.level}
            </Tag>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Avatar size={64} style={{ backgroundColor: '#52c41a', marginBottom: 8 }}>
              <EyeOutlined style={{ fontSize: 24 }} />
            </Avatar>
            <Title level={4}>{result.popularity?.watchers?.count || 0}</Title>
            <Text type="secondary">Watchers</Text>
            <br />
            <Tag color={getLevelColor(result.popularity?.watchers?.level)}>
              {result.popularity?.watchers?.level}
            </Tag>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderActivityMetrics = () => (
    <Card 
      title={
        <Space>
          <GitlabOutlined />
          <span>Development Activity</span>
          {getActivityIcon(result.timeline?.commitTrend)}
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5}>Commit Activity</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Total Commits: </Text>
              <Text>{result.activity?.commits?.total || 0}</Text>
            </div>
            <div>
              <Text strong>Recent (30 days): </Text>
              <Text>{result.activity?.commits?.recent || 0}</Text>
            </div>
            <div>
              <Text strong>Frequency: </Text>
              <Text>{result.activity?.commits?.frequency || 0} commits/week</Text>
            </div>
            <Progress 
              percent={Math.min((result.activity?.commits?.recent || 0) * 10, 100)} 
              size="small"
              format={() => `${result.activity?.commits?.recent || 0} recent`}
            />
          </Space>
        </Col>
        
        <Col xs={24} md={12}>
          <Title level={5}>Releases</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Total Releases: </Text>
              <Text>{result.activity?.releases?.total || 0}</Text>
            </div>
            <div>
              <Text strong>Latest: </Text>
              <Text>{result.activity?.releases?.latest || 'No releases'}</Text>
            </div>
            {result.activity?.releases?.latestDate && (
              <div>
                <Text strong>Released: </Text>
                <Text>{new Date(result.activity?.releases?.latestDate).toLocaleDateString()}</Text>
              </div>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderCommunityMetrics = () => (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          <span>Community & Collaboration</span>
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5}>Contributors</Title>
          <div style={{ marginBottom: 16 }}>
            <Statistic 
              value={result.community?.contributors?.total || 0}
              prefix={<UserOutlined />}
              suffix="total contributors"
            />
            <Text type="secondary">
              Diversity Score: {result.community?.contributors?.diversity || 0}%
            </Text>
          </div>
          
          {result.community?.contributors?.top && result.community.contributors.top.length > 0 && (
            <>
              <Title level={5}>Top Contributors</Title>
              <List
                size="small"
                dataSource={result.community.contributors.top}
                renderItem={contributor => (
                  <List.Item>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <Text strong>{contributor.login}</Text>
                      <Text type="secondary">{contributor.contributions} commits</Text>
                      <Text type="secondary">({contributor.percentage}%)</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </>
          )}
        </Col>
        
        <Col xs={24} md={12}>
          <Title level={5}>Issues Management</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Open Issues: </Text>
              <Badge count={result.community?.issues?.open || 0} style={{ backgroundColor: '#ff4d4f' }} />
            </div>
            <div>
              <Text strong>Closed Issues: </Text>
              <Badge count={result.community?.issues?.closed || 0} style={{ backgroundColor: '#52c41a' }} />
            </div>
            <div>
              <Text strong>Total Issues: </Text>
              <Text>{result.community?.issues?.total || 0}</Text>
            </div>
            <Progress 
              percent={result.community?.issues?.total > 0 ? 
                Math.round((result.community.issues.closed / result.community.issues.total) * 100) : 0
              }
              size="small"
              strokeColor="#52c41a"
              format={percent => `${percent}% resolved`}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderHealthMetrics = () => (
    <Card 
      title={
        <Space>
          <HeartOutlined />
          <span>Repository Health</span>
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5}>Maintenance Status</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Last Update: </Text>
              <Text>
                {result.health?.maintenance?.lastUpdate ? 
                  new Date(result.health.maintenance.lastUpdate).toLocaleDateString() : 
                  'Unknown'
                }
              </Text>
            </div>
            <div>
              <Text strong>Days Since Update: </Text>
              <Text>{result.health?.maintenance?.daysSinceUpdate || 0}</Text>
            </div>
            <div>
              <Text strong>Activity Level: </Text>
              <Tag color={
                result.health?.maintenance?.level === 'VERY_ACTIVE' ? 'green' :
                result.health?.maintenance?.level === 'ACTIVE' ? 'blue' :
                result.health?.maintenance?.level === 'MODERATE' ? 'orange' :
                result.health?.maintenance?.level === 'INACTIVE' ? 'red' : 'default'
              }>
                {result.health?.maintenance?.level || 'Unknown'}
              </Tag>
            </div>
          </Space>
        </Col>
        
        <Col xs={24} md={12}>
          <Title level={5}>Documentation & Features</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <SafetyOutlined style={{ marginRight: 8 }} />
              <Text>License: </Text>
              <Text>{result.basic?.license || 'No license'}</Text>
            </div>
            <div>
              <BookOutlined style={{ marginRight: 8 }} />
              <Text>Has Wiki: </Text>
              <Text>{result.basic?.hasWiki ? 'Yes' : 'No'}</Text>
            </div>
            <div>
              <CodeOutlined style={{ marginRight: 8 }} />
              <Text>Has Pages: </Text>
              <Text>{result.basic?.hasPages ? 'Yes' : 'No'}</Text>
            </div>
            <div>
              <BranchesOutlined style={{ marginRight: 8 }} />
              <Text>Default Branch: </Text>
              <Text>{result.basic?.defaultBranch || 'main'}</Text>
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderLanguages = () => (
    <Card 
      title={
        <Space>
          <CodeOutlined />
          <span>Programming Languages</span>
        </Space>
      } 
      style={{ marginBottom: 16 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>Primary Language: </Text>
        <Tag color="blue">{result.languages?.primary || 'Unknown'}</Tag>
        <Text type="secondary" style={{ marginLeft: 16 }}>
          Diversity: {result.languages?.diversity || 0} languages
        </Text>
      </div>
      
      {result.languages?.distribution && result.languages.distribution.length > 0 && (
        <List
          size="small"
          dataSource={result.languages.distribution.slice(0, 8)}
          renderItem={lang => (
            <List.Item>
              <Row style={{ width: '100%' }} align="middle">
                <Col span={8}>
                  <Text strong>{lang.language}</Text>
                </Col>
                <Col span={12}>
                  <Progress 
                    percent={lang.percentage} 
                    size="small"
                    showInfo={false}
                  />
                </Col>
                <Col span={4} style={{ textAlign: 'right' }}>
                  <Text type="secondary">{lang.percentage}%</Text>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const renderRecommendations = () => (
    <Card 
      title={
        <Space>
          <BugOutlined />
          <span>Improvement Recommendations</span>
        </Space>
      }
    >
      <List
        dataSource={result.recommendations || []}
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

  return (
    <div style={{ padding: screens.xs ? 8 : 16 }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <GitlabOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={2}>GitHub Repository Analytics</Title>
        <Paragraph type="secondary">
          Comprehensive analysis of repository statistics, community metrics, and development activity
        </Paragraph>
      </div>

      {isLoading && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Analyzing GitHub Repository...
          </Title>
          <Text type="secondary">
            Fetching repository statistics, contributor data, and development metrics
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
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderPopularityMetrics()}
            </Col>
            <Col xs={24} lg={12}>
              {renderActivityMetrics()}
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderCommunityMetrics()}
            </Col>
            <Col xs={24} lg={12}>
              {renderHealthMetrics()}
            </Col>
          </Row>
          
          {renderLanguages()}
          {renderRecommendations()}
        </div>
      )}

      {!result && !isLoading && !error && (
        <Card style={{ textAlign: 'center' }}>
          <GitlabOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">Ready to Analyze GitHub Repository</Title>
          <Text type="secondary">
            Enter a GitHub repository URL above to analyze popularity, activity, community, and health metrics
          </Text>
        </Card>
      )}
    </div>
  );
};

export default GitHubApiAnalyzer;
