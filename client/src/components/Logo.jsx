import React from 'react';

const Logo = ({ size = 'md', animated = false }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizes[size]} ${animated ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main A Shape */}
        <path
          d="M50 10 L90 80 L70 80 L60 60 L40 60 L30 80 L10 80 Z"
          fill="url(#logoGradient)"
          stroke="white"
          strokeWidth="2"
          filter="url(#glow)"
          className={animated ? 'animate-pulse' : ''}
        />
        
        {/* Inner triangle cutout */}
        <path
          d="M50 35 L60 55 L40 55 Z"
          fill="rgba(255,255,255,0.3)"
        />
        
        {/* Orbit swoosh */}
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="15"
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          transform="rotate(-30 50 50)"
          className={animated ? 'animate-spin-slow' : ''}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Geo pin marker */}
        <circle cx="50" cy="50" r="4" fill="white" />
      </svg>
      
      <span className="ml-2 font-bold text-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        GeoLink
      </span>
    </div>
  );
};

export default Logo;
