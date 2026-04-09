import React from 'react';

const Skeleton = ({ 
  variant = 'text', 
  width,
  height,
  className = '',
  animate = true 
}) => {
  const baseClasses = animate ? 'animate-pulse' : '';
  const bgClass = 'bg-gray-200 dark:bg-gray-700';

  const variants = {
    text: (
      <div 
        className={`${baseClasses} ${bgClass} rounded h-4 ${className}`}
        style={{ width: width || '100%' }}
      />
    ),
    title: (
      <div 
        className={`${baseClasses} ${bgClass} rounded-lg h-8 ${className}`}
        style={{ width: width || '75%' }}
      />
    ),
    avatar: (
      <div 
        className={`${baseClasses} ${bgClass} rounded-full ${className}`}
        style={{ width: width || '48px', height: height || '48px' }}
      />
    ),
    image: (
      <div 
        className={`${baseClasses} ${bgClass} rounded-xl ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}
      />
    ),
    card: (
      <div className={`${baseClasses} bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`${bgClass} rounded-full w-12 h-12`} />
          <div className="flex-1 space-y-2">
            <div className={`${bgClass} rounded h-4 w-3/4`} />
            <div className={`${bgClass} rounded h-3 w-1/2`} />
          </div>
        </div>
        <div className={`${bgClass} rounded-xl h-48 mb-4`} />
        <div className="space-y-2">
          <div className={`${bgClass} rounded h-4`} />
          <div className={`${bgClass} rounded h-4 w-5/6`} />
        </div>
      </div>
    ),
    list: (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${baseClasses} flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}>
            <div className={`${bgClass} rounded-full w-10 h-10`} />
            <div className="flex-1 space-y-2">
              <div className={`${bgClass} rounded h-4 w-3/4`} />
              <div className={`${bgClass} rounded h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    )
  };

  return variants[variant] || variants.text;
};

export default Skeleton;
