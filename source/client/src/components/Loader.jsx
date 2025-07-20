import React from 'react';

const Loader = ({ 
  size = 'default', 
  text = 'Loading...', 
  variant = 'spinner',
  className = ''
}) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const SpinnerLoader = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizes[size]}`} />
  )

  const DotsLoader = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )

  const PulseLoader = () => (
    <div className={`bg-primary-500 rounded-full animate-pulse ${sizes[size]}`} />
  )

  const AnalysisLoader = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-lg font-semibold text-gray-700">Analyzing Repository</span>
        </div>
        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Fetching repository content...</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
            <span>Processing code files...</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
            <span>AI analysis in progress...</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />
      case 'pulse':
        return <PulseLoader />
      case 'analysis':
        return <AnalysisLoader />
      default:
        return <SpinnerLoader />
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {variant === 'analysis' ? (
        renderLoader()
      ) : (
        <>
          {renderLoader()}
          {text && (
            <p className="mt-3 text-gray-600 text-center">
              {text}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default Loader;
