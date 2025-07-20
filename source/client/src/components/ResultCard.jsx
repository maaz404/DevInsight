import React from 'react';

const ResultCard = ({ 
  title, 
  children, 
  icon,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    error: 'bg-red-50 border border-red-200',
    info: 'bg-blue-50 border border-blue-200',
    gradient: 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
  }

  return (
    <div className={`${variants[variant]} rounded-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

// Sub-components for common content types
const ResultSection = ({ label, value, variant = 'default' }) => {
  const variants = {
    default: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700'
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`font-medium ${variants[variant]}`}>{value}</span>
    </div>
  )
}

const ResultList = ({ items, type = 'default' }) => {
  const icons = {
    default: '•',
    success: '✓',
    warning: '⚠',
    error: '✗',
    improvement: '→',
    security: '🔒'
  }

  const colors = {
    default: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    improvement: 'text-orange-500',
    security: 'text-purple-500'
  }

  if (!items || items.length === 0) return null

  return (
    <ul className="text-sm text-gray-700 space-y-1">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className={`${colors[type]} mr-2 flex-shrink-0`}>
            {icons[type]}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// Attach sub-components to main component
ResultCard.Section = ResultSection;
ResultCard.List = ResultList;

export default ResultCard;
