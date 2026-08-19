// src/components/CirvyLogo.jsx
// Renders the official Cirvy brand logo & icon from assets.

import cirvyIcon from '@/assets/cirvyicon.png'
import cirvyLogo from '@/assets/cirvylogo.png'

export default function CirvyLogo({
  variant = 'icon', // 'icon' | 'full'
  size = 36,
  className = '',
  showGlow = false,
}) {
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={cirvyLogo}
          alt="Cirvy"
          className="object-contain transition-transform duration-300 hover:scale-[1.02]"
          style={{ height: size, width: 'auto' }}
        />
      </div>
    )
  }

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-35"
          style={{
            background: 'radial-gradient(circle, rgba(143,188,148,0.5) 0%, rgba(74,122,140,0.4) 60%, transparent 100%)',
          }}
        />
      )}
      <img
        src={cirvyIcon}
        alt="Cirvy Logo"
        className="relative z-10 object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
