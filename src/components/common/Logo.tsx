import React from 'react'

interface LogoProps {
  className?: string
  iconSize?: string
  textSize?: string
  lightText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  iconSize = 'w-8 h-8', 
  textSize = 'text-xl',
  lightText = false
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon matching the OrgPlus Interlocking Infinity Clover Logo */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${iconSize} shrink-0`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer clover lobes */}
        <path
          d="M 50,22 
             C 38,22 28,32 28,44 
             C 28,52 34,58 40,60 
             C 34,62 28,68 28,76 
             C 28,88 38,98 50,98 
             C 62,98 72,88 72,76 
             C 72,68 66,62 60,60 
             C 66,58 72,52 72,44 
             C 72,32 62,22 50,22 Z"
          stroke="#701a75"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner vertical ribbon loop (Infinity-style) */}
        <path
          d="M 50,32 
             C 43,32 38,37 38,44 
             C 38,51 44,55 50,58 
             C 56,61 62,65 62,72 
             C 62,79 57,84 50,84 
             C 43,84 38,79 38,72 
             C 38,65 44,61 50,58 
             C 56,55 62,51 62,44 
             C 62,37 57,32 50,32 Z"
          stroke="#a21caf"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central core node */}
        <circle cx="50" cy="58" r="4" fill="#d946ef" className="animate-pulse" />
      </svg>
      {/* Brand Text */}
      <span className={`font-black tracking-wide ${textSize}`}>
        <span className="text-purple-500">Org</span>
        <span className={lightText ? 'text-white' : 'text-slate-300'}>Plus</span>
      </span>
    </div>
  )
}
