import React from 'react';

const BadgePill = ({ 
  children, 
  color = 'default',
  size = 'md',
  className = '' 
}) => {
  const colorClasses = {
    default: 'bg-white text-black border-black',
    success: 'bg-neo-green text-black border-black',
    warning: 'bg-yellow-300 text-black border-black',
    error: 'bg-red-400 text-black border-black',
    info: 'bg-neo-blue text-black border-black',
    pink: 'bg-neo-pink text-black border-black'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      ${colorClasses[color]}
      ${sizeClasses[size]}
      font-display font-bold
      border-2
      shadow-neo-sm
      inline-block
      rounded-full
      ${className}
    `}>
      {children}
    </span>
  );
};

export default BadgePill;
