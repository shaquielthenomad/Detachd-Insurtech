import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HolographicCardProps {
  children: React.ReactNode;
  variant?: 'verification' | 'premium' | 'trust' | 'claim';
  className?: string;
  animated?: boolean;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  variant = 'verification',
  className = '',
  animated = true
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const gradientVariants = {
    verification: 'from-slate-700 via-blue-700 to-slate-800',
    premium: 'from-blue-800 via-slate-700 to-blue-900',
    trust: 'from-slate-600 via-blue-600 to-slate-700',
    claim: 'from-blue-700 via-slate-600 to-blue-800'
  };

  const backgroundPattern = {
    verification: '🏛️',
    premium: '⭐',
    trust: '🛡️',
    claim: '📋'
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={animated ? { scale: 1.02 } : {}}
    >
      {/* Holographic Background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientVariants[variant]} opacity-90`}
        style={{
          background: isHovered 
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
               linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(59, 130, 246, 0.9) 50%, rgba(51, 65, 85, 0.9) 100%)`
            : undefined
        }}
      />

      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 text-6xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
                <text x='30' y='35' text-anchor='middle' font-size='20' fill='white' opacity='0.2'>
                  ${backgroundPattern[variant]}
                </text>
              </svg>
            `)}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0"
        animate={animated ? {
          background: [
            'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          ],
          x: ['-100%', '100%']
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear'
        }}
      />

      {/* Glassmorphism Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm border border-white/30" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating Particles */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i * 10)}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 2 + (i * 0.5),
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}; 