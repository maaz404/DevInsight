import React from 'react';

const ResultBox = ({ 
  children, 
  title = "Analysis Results", 
  className = '',
  loading = false 
}) => {
  return (
    <div className={`
      bg-black 
      text-white 
      border-2 border-black 
      shadow-neo 
      p-6 
      font-mono 
      text-sm
      ${className}
    `}>
      {title && (
        <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
          <span className="text-neo-green">▶</span>
          <span className="font-display font-bold text-base">{title}</span>
        </div>
      )}
      
      {loading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-neo-green animate-pulse">●</span>
            <span className="text-gray-300">Analyzing repository...</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 animate-pulse">●</span>
            <span className="text-gray-300">Checking dependencies...</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neo-blue animate-pulse">●</span>
            <span className="text-gray-300">Scanning code quality...</span>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResultBox;
