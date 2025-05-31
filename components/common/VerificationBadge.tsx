import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Star, Award } from 'lucide-react';

interface VerificationBadgeProps {
  type: 'verified' | 'premium' | 'trusted' | 'elite';
  label: string;
  since?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  label,
  since,
  animated = true,
  size = 'md'
}) => {
  const badgeConfig = {
    verified: {
      icon: CheckCircle,
      gradient: 'from-emerald-400 to-teal-600',
      bgGradient: 'from-emerald-500/20 to-teal-600/20',
      glow: 'shadow-emerald-500/50'
    },
    premium: {
      icon: Star,
      gradient: 'from-blue-400 to-slate-600',
      bgGradient: 'from-blue-500/20 to-slate-600/20',
      glow: 'shadow-blue-500/50'
    },
    trusted: {
      icon: Shield,
      gradient: 'from-blue-500 to-slate-700',
      bgGradient: 'from-blue-600/20 to-slate-700/20',
      glow: 'shadow-blue-600/50'
    },
    elite: {
      icon: Award,
      gradient: 'from-yellow-400 to-orange-600',
      bgGradient: 'from-yellow-500/20 to-orange-600/20',
      glow: 'shadow-yellow-500/50'
    }
  };

  const sizeConfig = {
    sm: {
      container: 'px-3 py-1.5 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-6 py-3 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const config = badgeConfig[type];
  const sizeStyles = sizeConfig[size];
  const IconComponent = config.icon;

  return (
    <motion.div
      className={`
        relative inline-flex items-center gap-2 rounded-full 
        bg-gradient-to-r ${config.bgGradient}
        backdrop-blur-sm border border-white/20
        ${sizeStyles.container}
      `}
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={animated ? { scale: 1.05 } : {}}
    >
      {/* Holographic background glow */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-30 blur-sm ${config.glow}`}
        animate={animated ? {
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={animated ? {
          background: [
            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.0) 50%, transparent 100%)',
            'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.0) 50%, transparent 100%)'
          ]
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        <motion.div
          animate={animated ? { rotate: [0, 360] } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <IconComponent className={`${sizeStyles.icon} text-white drop-shadow-lg`} />
        </motion.div>
        
        <div className="flex flex-col">
          <span className={`font-medium text-white ${sizeStyles.text} drop-shadow-lg`}>
            {label}
          </span>
          {since && (
            <span className="text-xs text-white/80 font-light">
              Since {since}
            </span>
          )}
        </div>
      </div>

      {/* Floating particles around badge */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${20 + (i * 30)}%`,
                top: `${10 + (i * 20)}%`,
              }}
              animate={{
                y: [-5, -15, -5],
                opacity: [0.6, 1, 0.6],
                x: [0, 5, 0]
              }}
              transition={{
                duration: 1.5 + (i * 0.3),
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}; 