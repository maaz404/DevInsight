import React from 'react';

const CTAButton = ({ 
  children, 
  onClick, 
  className = '', 
  size = 'lg',
  color = 'green',
  disabled = false,
  tilt = true 
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const colorClasses = {
    green: 'bg-neo-green hover:bg-green-400 active:bg-green-600',
    pink: 'bg-neo-pink hover:bg-pink-400 active:bg-pink-600',
    blue: 'bg-neo-blue hover:bg-blue-400 active:bg-blue-600',
    yellow: 'bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${tilt ? '-rotate-2 hover:rotate-0' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neo-sm active:shadow-none'}
        font-display font-bold
        text-black
        border-2 border-black
        shadow-neo
        transition-all duration-200 ease-out
        transform hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default CTAButton;
