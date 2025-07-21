import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Typography, 
  List, 
  Tag, 
  Space, 
  Badge, 
  Tooltip, 
  Alert, 
  Tabs, 
  Table,
  Button,
  Statistic,
  Collapse,
  Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  InfoCircleOutlined,
  BugOutlined,
  SafetyOutlined,
  ToolOutlined,
  RocketOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTheme } from '../../theme/ThemeProvider';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const DependencyAnalyzer = ({ analysis, loading = false }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('summary');

  if (loading) {
    return (
      <Card title="📦 Dependency Analysis" loading={true}>
        <div style={{ height: 300 }} />
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card title="📦 Dependency Analysis">
        <Alert 
          message="No dependency analysis available" 
          description="Run an analysis to see dependency health insights"
          type="info" 
          showIcon 
        />
      </Card>
    );
  }

  // Helper functions
  const getRiskColor = (riskLevel) => {
    const colors = {
      CRITICAL: '#f5222d',
      HIGH: '#fa8c16', 
      MEDIUM: '#faad14',
      LOW: '#1890ff',
      SAFE: '#52c41a',
      UNKNOWN: '#d9d9d9'
    };
    return colors[riskLevel] || colors.UNKNOWN;
  };

  const getRiskIcon = (riskLevel) => {
    const icons = {
      CRITICAL: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      HIGH: <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />,
      MEDIUM: <WarningOutlined style={{ color: '#faad14' }} />,
      LOW: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      SAFE: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      UNKNOWN: <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />
    };
    return icons[riskLevel] || icons.UNKNOWN;
  };

  const getHealthColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#f5222d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'red',
      high: 'orange', 
      medium: 'yellow',
      low: 'blue',
      safe: 'green'
    };
    return colors[priority] || 'default';
  };

  // Dependency table columns
  const dependencyColumns = [
    {
      title: 'Package',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.description?.slice(0, 50)}...
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Current',
      dataIndex: 'currentVersion',
      key: 'current',
      width: 100,
      render: (version) => <Tag color="blue">{version}</Tag>
    },
    {
      title: 'Latest',
      dataIndex: 'latestVersion', 
      key: 'latest',
      width: 100,
      render: (version) => <Tag color="green">{version}</Tag>
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'risk',
      width: 120,
      render: (risk, record) => (
        <Space>
          {getRiskIcon(risk)}
          <Tag color={getRiskColor(risk)} style={{ margin: 0 }}>
            {risk}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.isOutdated && (
            <Tooltip title={`npm update ${record.name}`}>
              <Button size="small" type="primary" ghost>
                Update
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Collect all packages for tables
  const allPackages = [];
  if (analysis.dependencies) {
    Object.values(analysis.dependencies).forEach(group => {
      group.packages?.forEach(pkg => {
        allPackages.push({ ...pkg, type: group.type });
      });
    });
  }

  const criticalPackages = allPackages.filter(pkg => pkg.riskLevel === 'CRITICAL');
  const outdatedPackages = allPackages.filter(pkg => pkg.isOutdated);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Overall Health Score */}
      <Card 
        title={
          <Space>
            <SafetyOutlined />
            <span>📦 Dependency Health Check</span>
            {analysis.exists ? (
              <Badge status="success" text="package.json Found" />
            ) : (
              <Badge status="error" text="No package.json" />
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
                percent={analysis.summary?.healthScore || 0}
                strokeColor={getHealthColor(analysis.summary?.healthScore || 0)}
                size={120}
                format={percent => (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Health</div>
                  </div>
                )}
              />
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Dependencies"
                  value={analysis.summary?.totalDependencies || 0}
                  prefix={<CodeOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Outdated"
                  value={analysis.summary?.outdatedDependencies || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Critical Issues"
                  value={analysis.summary?.criticalIssues || 0}
                  prefix={<BugOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Risk Score"
                  value={analysis.security?.riskScore || 0}
                  suffix="/ 100"
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: getHealthColor(100 - (analysis.security?.riskScore || 0)) }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'summary',
              label: (
                <Space>
                  <InfoCircleOutlined />
                  Summary
                </Space>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {/* Critical Issues */}
                  {criticalPackages.length > 0 && (
                    <Col span={24}>
                      <Alert
                        message={`${criticalPackages.length} Critical Dependencies Found`}
                        description="These packages have critical security risks and should be updated immediately"
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                      <Table
                        dataSource={criticalPackages}
                        columns={dependencyColumns}
                        pagination={false}
                        size="small"
                        rowKey="name"
                      />
                    </Col>
                  )}

                  {/* Package Overview */}
                  <Col xs={24} lg={12}>
                    <Card title="Package Information" size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Name: </Text>
                          <Text>{analysis.packageName}</Text>
                        </div>
                        <div>
                          <Text strong>Version: </Text>
                          <Tag color="blue">{analysis.version}</Tag>
                        </div>
                        <div>
                          <Text strong>Repository: </Text>
                          <Text type="secondary">{analysis.repository}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  {/* Scripts Analysis */}
                  <Col xs={24} lg={12}>
                    <Card title="Scripts & Tools" size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Text>Test Script:</Text>
                          <Tag color={analysis.scripts?.hasTest ? 'green' : 'red'}>
                            {analysis.scripts?.hasTest ? 'Available' : 'Missing'}
                          </Tag>
                        </Space>
                        <Space>
                          <Text>Build Script:</Text>
                          <Tag color={analysis.scripts?.hasBuild ? 'green' : 'orange'}>
                            {analysis.scripts?.hasBuild ? 'Available' : 'Missing'}
                          </Tag>
                        </Space>
                        <Space>
                          <Text>Lint Script:</Text>
                          <Tag color={analysis.scripts?.hasLint ? 'green' : 'orange'}>
                            {analysis.scripts?.hasLint ? 'Available' : 'Missing'}
                          </Tag>
                        </Space>
                        <Space>
                          <Text>Total Scripts:</Text>
                          <Badge count={analysis.scripts?.total || 0} />
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'dependencies',
              label: (
                <Space>
                  <CodeOutlined />
                  Dependencies
                  <Badge count={analysis.summary?.totalDependencies || 0} />
                </Space>
              ),
              children: (
                <Collapse defaultActiveKey={['production']} ghost>
                  {Object.entries(analysis.dependencies || {}).map(([key, group]) => (
                    group.count > 0 && (
                      <Panel
                        header={
                          <Space>
                            <Text strong style={{ textTransform: 'capitalize' }}>{group.type}</Text>
                            <Badge count={group.count} />
                            {group.packages?.some(p => p.riskLevel === 'CRITICAL') && (
                              <Tag color="red" size="small">Critical Issues</Tag>
                            )}
                          </Space>
                        }
                        key={key}
                      >
                        <Table
                          dataSource={group.packages}
                          columns={dependencyColumns}
                          pagination={{ pageSize: 10 }}
                          size="small"
                          rowKey="name"
                        />
                      </Panel>
                    )
                  ))}
                </Collapse>
              )
            },
            {
              key: 'recommendations',
              label: (
                <Space>
                  <ThunderboltOutlined />
                  Recommendations
                  <Badge count={analysis.recommendations?.length || 0} />
                </Space>
              ),
              children: (
                <List
                  dataSource={analysis.recommendations || []}
                  renderItem={(rec, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            background: getPriorityColor(rec.priority) === 'red' ? '#fff2f0' : 
                                       getPriorityColor(rec.priority) === 'orange' ? '#fff7e6' : '#f6ffed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${getPriorityColor(rec.priority) === 'red' ? '#ffccc7' : 
                                                 getPriorityColor(rec.priority) === 'orange' ? '#ffd591' : '#d9f7be'}`
                          }}>
                            <Text style={{ 
                              fontSize: 12, 
                              fontWeight: 'bold',
                              color: getPriorityColor(rec.priority) === 'red' ? '#f5222d' :
                                     getPriorityColor(rec.priority) === 'orange' ? '#fa8c16' : '#52c41a'
                            }}>
                              {index + 1}
                            </Text>
                          </div>
                        }
                        title={
                          <Space>
                            <Tag color={getPriorityColor(rec.priority)} size="small">
                              {rec.priority?.toUpperCase()}
                            </Tag>
                            <Text>{rec.message}</Text>
                            {rec.package && <Tag color="blue">{rec.package}</Tag>}
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph style={{ fontSize: 12, margin: 0 }}>
                              {rec.suggestion}
                            </Paragraph>
                            {rec.command && (
                              <div style={{ marginTop: 4 }}>
                                <Text code style={{ fontSize: 11, background: '#f6f8fa', padding: '2px 4px' }}>
                                  {rec.command}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default DependencyAnalyzer;
