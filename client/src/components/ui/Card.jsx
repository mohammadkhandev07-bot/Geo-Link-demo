import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '',
  hover = true,
  padding = 'normal',
  onClick
}) => {
  const paddings = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700
        ${hover ? 'cursor-pointer transition-all duration-300' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
