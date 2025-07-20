import React from 'react';
import { Progress, Typography } from 'antd';

const { Text } = Typography;

const AntdScoreMeter = ({ 
  score, 
  maxScore = 100, 
  label,
  size = 'default',
  showPercentage = true,
  colorScheme = 'default'
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getColor = (percentage) => {
    if (colorScheme === 'blue') {
      if (percentage >= 80) return '#1890ff';
      if (percentage >= 60) return '#69c0ff';
      return '#91d5ff';
    }
    if (colorScheme === 'purple') {
      if (percentage >= 80) return '#722ed1';
      if (percentage >= 60) return '#b37feb';
      return '#d3adf7';
    }
    // Default color scheme
    if (percentage >= 80) return '#52c41a'; // green
    if (percentage >= 60) return '#faad14'; // orange
    return '#ff4d4f'; // red
  };

  const getSize = () => {
    switch (size) {
      case 'small': return 80;
      case 'large': return 140;
      default: return 100;
    }
  };

  const getStatus = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'active';
    return 'exception';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Progress
        type="circle"
        percent={percentage}
        size={getSize()}
        strokeColor={getColor(percentage)}
        status={getStatus(percentage)}
        format={(percent) => showPercentage ? `${percent}%` : `${score}/${maxScore}`}
      />
      {label && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">{label}</Text>
        </div>
      )}
    </div>
  );
};

export default AntdScoreMeter;
