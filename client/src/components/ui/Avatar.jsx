import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  online = false,
  verified = false,
  story = false,
  link,
  onClick,
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const initials = alt?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const avatarContent = (
    <div className="relative inline-block">
      {/* Story ring */}
      {story && (
        <motion.div 
          className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Main avatar */}
      <div className={`
        relative ${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold
        ${story ? 'ring-2 ring-white dark:ring-gray-900' : ''}
      `}>
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span className={`${src ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
          {initials}
        </span>
      </div>

      {/* Online indicator */}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full">
          <span className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
        </span>
      )}

      {/* Verified badge */}
      {verified && (
        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white dark:border-gray-900">
          ✓
        </span>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} onClick={onClick} className={`inline-block hover:opacity-80 transition-opacity ${className}`}>
        {avatarContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={`inline-block cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
      {avatarContent}
    </div>
  );
};

export default Avatar;
