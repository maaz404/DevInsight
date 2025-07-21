import React from 'react';
import { Card, Row, Col, Progress, Typography, List, Tag, Space, Badge, Tooltip, Alert } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
  CodeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useTheme } from '../../theme/ThemeProvider';

const { Title, Text, Paragraph } = Typography;

const ReadmeAnalyzer = ({ analysis, loading = false }) => {
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <Card title="📄 README Analysis" loading={true}>
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card title="📄 README Analysis">
        <Alert 
          message="No README analysis available" 
          description="Run an analysis to see README insights"
          type="info" 
          showIcon 
        />
      </Card>
    );
  }

  // Helper function for section status
  const getSectionStatus = (found, required) => {
    if (found) return { icon: <CheckCircleOutlined />, color: 'success', text: 'Found' };
    if (required) return { icon: <CloseCircleOutlined />, color: 'error', text: 'Missing (Required)' };
    return { icon: <ExclamationCircleOutlined />, color: 'warning', text: 'Missing (Optional)' };
  };

  // Helper function for badge status
  const getBadgeStatus = (found) => {
    return found 
      ? { icon: <CheckCircleOutlined />, color: 'success', text: 'Present' }
      : { icon: <CloseCircleOutlined />, color: 'default', text: 'Missing' };
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#f5222d';
  };

  // Priority colors for recommendations
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Overall Score Card */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>📄 README Analysis</span>
            {analysis.exists ? (
              <Badge status="success" text="Found" />
            ) : (
              <Badge status="error" text="Missing" />
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={analysis.score}
                strokeColor={getScoreColor(analysis.score)}
                size={120}
                format={percent => (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Score</div>
                  </div>
                )}
              />
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6}>
                <Tooltip title="README file size in characters">
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Length</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {analysis.length?.toLocaleString() || 0}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>characters</Text>
                  </div>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Sections completeness percentage">
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Sections</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {analysis.sections?.completeness || 0}%
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>complete</Text>
                  </div>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Status badges found">
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Badges</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {analysis.badges?.count || 0}/{analysis.badges?.total || 5}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>found</Text>
                  </div>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Code examples and blocks">
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Code</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {analysis.codeBlocks?.blocks || 0}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>blocks</Text>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Sections Analysis */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <InfoCircleOutlined />
                Sections Analysis
              </Space>
            }
            size="small"
          >
            <List
              size="small"
              dataSource={Object.entries(analysis.sections?.details || {})}
              renderItem={([key, section]) => {
                const status = getSectionStatus(section.found, section.required);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Text style={{ color: status.color === 'success' ? '#52c41a' : status.color === 'error' ? '#f5222d' : '#faad14' }}>
                          {status.icon}
                        </Text>
                      }
                      title={
                        <Space>
                          <Text style={{ textTransform: 'capitalize' }}>{key}</Text>
                          {section.required && <Tag color="red" size="small">Required</Tag>}
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {status.text} • Weight: {section.weight}%
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* Badges Analysis */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined />
                Status Badges
              </Space>
            }
            size="small"
          >
            <List
              size="small"
              dataSource={Object.entries(analysis.badges?.details || {})}
              renderItem={([key, found]) => {
                const status = getBadgeStatus(found);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Text style={{ color: found ? '#52c41a' : '#d9d9d9' }}>
                          {status.icon}
                        </Text>
                      }
                      title={<Text style={{ textTransform: 'capitalize' }}>{key}</Text>}
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {status.text}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* Additional Metrics */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CodeOutlined />
                Content Metrics
              </Space>
            }
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Space>
                  <Text>Code Blocks:</Text>
                  <Tag color={analysis.codeBlocks?.blocks > 0 ? 'green' : 'default'}>
                    {analysis.codeBlocks?.blocks || 0}
                  </Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Space>
                  <Text>Inline Code:</Text>
                  <Tag color={analysis.codeBlocks?.inline > 0 ? 'green' : 'default'}>
                    {analysis.codeBlocks?.inline || 0}
                  </Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Space>
                  <Text>External Links:</Text>
                  <Tag color={analysis.links?.external > 0 ? 'green' : 'default'}>
                    {analysis.links?.external || 0}
                  </Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Space>
                  <Text>Documentation Links:</Text>
                  <Tag color={analysis.links?.hasDocumentation ? 'green' : 'default'}>
                    {analysis.links?.hasDocumentation ? 'Yes' : 'No'}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Recommendations */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ExclamationCircleOutlined />
                Recommendations
                <Badge count={analysis.recommendations?.length || 0} />
              </Space>
            }
            size="small"
          >
            {analysis.recommendations?.length > 0 ? (
              <List
                size="small"
                dataSource={analysis.recommendations}
                renderItem={(rec) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={getPriorityColor(rec.priority)} size="small">
                            {rec.priority?.toUpperCase()}
                          </Tag>
                          <Text style={{ fontSize: 12 }}>{rec.message}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {rec.suggestion}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">No recommendations - your README looks great! 🎉</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReadmeAnalyzer;
