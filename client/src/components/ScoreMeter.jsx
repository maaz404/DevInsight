import React from 'react';

const ScoreMeter = ({ 
  score, 
  maxScore = 100, 
  label,
  size = 'default',
  showPercentage = true,
  colorScheme = 'default'
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100)
  
  const sizes = {
    small: { container: 'h-2', text: 'text-sm' },
    default: { container: 'h-3', text: 'text-base' },
    large: { container: 'h-4', text: 'text-lg' }
  }

  const getColor = (percentage) => {
    if (colorScheme === 'default') {
      if (percentage >= 80) return 'bg-green-500'
      if (percentage >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }
    if (colorScheme === 'blue') return 'bg-blue-500'
    if (colorScheme === 'purple') return 'bg-purple-500'
    if (colorScheme === 'indigo') return 'bg-indigo-500'
    return 'bg-gray-500'
  }

  const getBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium text-gray-700 ${sizes[size].text}`}>
            {label}
          </span>
          {showPercentage && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeColor(percentage)}`}>
              {Math.round(percentage)}/100
            </span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`${sizes[size].container} ${getColor(percentage)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {!showPercentage && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{maxScore}</span>
        </div>
      )}
    </div>
  )
}

// Circular score meter variant
export const CircularScoreMeter = ({ 
  score, 
  maxScore = 100, 
  label,
  size = 'default'
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100)
  const radius = size === 'large' ? 45 : size === 'small' ? 25 : 35
  const strokeWidth = size === 'large' ? 8 : size === 'small' ? 4 : 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  const getColor = (percentage) => {
    if (percentage >= 80) return '#10b981' // green-500
    if (percentage >= 60) return '#f59e0b' // yellow-500
    return '#ef4444' // red-500
  }

  const containerSize = size === 'large' ? 'w-24 h-24' : size === 'small' ? 'w-16 h-16' : 'w-20 h-20'
  const textSize = size === 'large' ? 'text-lg' : size === 'small' ? 'text-sm' : 'text-base'

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${containerSize}`}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getColor(percentage)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-gray-800 ${textSize}`}>
            {Math.round(percentage)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-600 text-center mt-2 max-w-20">
          {label}
        </span>
      )}
    </div>
  )
}

export default ScoreMeter;
