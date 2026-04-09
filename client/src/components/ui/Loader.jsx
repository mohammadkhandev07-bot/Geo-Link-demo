import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const loader = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} relative`}
    >
      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-600" />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {loader}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-6 text-gray-600 dark:text-gray-400 font-medium ${textSizes[size]}`}
        >
          {text}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {loader}
      {text && <p className={`mt-4 text-gray-500 dark:text-gray-400 ${textSizes[size]}`}>{text}</p>}
    </div>
  );
};

// Skeleton Component
export const Skeleton = ({ type = 'text', lines = 3, className = '', animate = true }) => {
  const baseClasses = animate ? 'animate-pulse' : '';
  
  if (type === 'avatar') {
    return (
      <div className={`${baseClasses} bg-gray-200 dark:bg-gray-700 rounded-full ${className}`} />
    );
  }

  if (type === 'image') {
    return (
      <div className={`${baseClasses} bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
    );
  }

  if (type === 'card') {
    return (
      <div className={`${baseClasses} bg-white dark:bg-gray-800 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default Loader;
