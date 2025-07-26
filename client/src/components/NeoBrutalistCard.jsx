import React from 'react';

const NeoBrutalistCard = ({ 
  children, 
  className = '',
  background = 'white',
  shadow = 'neo',
  tilt = false 
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    yellow: 'bg-pastel-yellow',
    pink: 'bg-pastel-pink',
    green: 'bg-neo-green',
    blue: 'bg-neo-blue'
  };

  const shadowClasses = {
    none: 'shadow-none',
    neo: 'shadow-neo',
    'neo-sm': 'shadow-neo-sm',
    'neo-lg': 'shadow-neo-lg'
  };

  return (
    <div className={`
      ${backgroundClasses[background]}
      ${shadowClasses[shadow]}
      ${tilt ? 'rotate-1 hover:-rotate-1' : ''}
      border-2 border-black
      p-6
      transition-all duration-300 ease-out
      hover:scale-105
      ${className}
    `}>
      {children}
    </div>
  );
};

export default NeoBrutalistCard;
