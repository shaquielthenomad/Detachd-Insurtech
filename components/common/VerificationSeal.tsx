import React from 'react';
import { motion } from 'framer-motion';
import CircularText from './CircularText';
import { ShieldCheckIcon } from './Icon';

interface VerificationSealProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showGlow?: boolean;
}

const VerificationSeal: React.FC<VerificationSealProps> = ({ 
  size = 'medium', 
  className = '',
  showGlow = true 
}) => {
  const sizeClasses = {
    small: 'verification-seal',
    medium: 'verification-seal-large',
    large: 'w-56 h-56'
  };

  const logoSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 30,
    medium: 25,
    large: 20
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer glow effect */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Circular border */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-blue-400/50"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner verification ring */}
      <motion.div
        className="absolute inset-2 rounded-full border border-blue-300/30"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Circular Text */}
      <CircularText
        text="VERIFIED • SecureAI • "
        spinDuration={textSizes[size]}
        onHover="speedUp"
        className={`${sizeClasses[size]} relative z-10`}
      />
      
      {/* Center Logo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-20"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-full p-3 border border-blue-400/30">
          <ShieldCheckIcon className={`${logoSizes[size]} text-blue-400`} />
        </div>
      </motion.div>
      
      {/* Center text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mt-8">
          <div className="text-xs font-semibold text-blue-300 tracking-wider">SECURE</div>
          <div className="text-xs font-semibold text-blue-300 tracking-wider">AI</div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationSeal; 