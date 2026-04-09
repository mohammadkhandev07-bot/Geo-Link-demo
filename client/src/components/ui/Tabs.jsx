import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ 
  tabs, 
  defaultTab = 0,
  onChange,
  variant = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index, tabs[index]);
  };

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'border-b border-gray-200 dark:border-gray-700'
  };

  return (
    <div className={className}>
      <div className={`flex ${variants[variant]}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              relative flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200
              ${variant === 'underline' ? 'rounded-none border-b-2' : ''}
              ${activeTab === index 
                ? variant === 'underline'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md'
                : variant === 'underline'
                  ? 'text-gray-500 border-transparent hover:text-gray-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline-block" />}
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
