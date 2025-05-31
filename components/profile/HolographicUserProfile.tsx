import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HolographicCard } from '../common/HolographicCard';
import { VerificationBadge } from '../common/VerificationBadge';
import { MapPin, Phone, Mail, Calendar, Shield, Award } from 'lucide-react';
import { JACOB_DOE_PERSONA, getRiskScoreColor } from '../../constants';

interface HolographicUserProfileProps {
  variant?: 'full' | 'compact';
  showTrustScore?: boolean;
  className?: string;
  userData?: any; // Optional MCP data to override defaults
}

export const HolographicUserProfile: React.FC<HolographicUserProfileProps> = ({
  variant = 'full',
  showTrustScore = true,
  className = '',
  userData = null
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use MCP data if provided, otherwise fall back to centralized persona
  const profileData = userData || JACOB_DOE_PERSONA;

  const trustScoreColor = getRiskScoreColor(profileData.trustScore || profileData.riskScore || JACOB_DOE_PERSONA.trustScore);

  if (variant === 'compact') {
    return (
      <HolographicCard variant="trust" className={`max-w-sm ${className}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.img
              src={profileData.avatarUrl}
              alt={profileData.name}
              className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <VerificationBadge 
                type="trusted" 
                label="✓" 
                size="sm"
              />
            </motion.div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg drop-shadow-lg">
              {profileData.name}
            </h3>
            <p className="text-white/80 text-sm">
              Detachd Member since {profileData.memberSince}
            </p>
          </div>
        </div>
      </HolographicCard>
    );
  }

  return (
    <HolographicCard variant="trust" className={`max-w-md ${className}`}>
      <div 
        className="space-y-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with Avatar */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={profileData.avatarUrl}
                alt={profileData.name}
                className="w-20 h-20 rounded-xl border-2 border-white/30 object-cover shadow-lg"
              />
              
              {/* Holographic overlay on avatar */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20"
                animate={isHovered ? {
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.02, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Floating verification icon */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-slate-600 p-2 rounded-full shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>

          <div className="flex-1">
            <motion.h2 
              className="text-2xl font-bold text-white drop-shadow-lg"
              animate={isHovered ? { scale: 1.02 } : {}}
            >
              {profileData.name}
            </motion.h2>
            
            <div className="mt-2 space-y-1">
              <VerificationBadge 
                type="trusted" 
                label={profileData.verificationLevel || JACOB_DOE_PERSONA.verificationLevel}
                since={profileData.memberSince || JACOB_DOE_PERSONA.memberSince}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Trust Score - Now consistent with risk score and uses MCP data when available */}
        {showTrustScore && (
          <motion.div 
            className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 font-medium text-sm">Trust Score</span>
              <motion.span 
                className={`text-xl font-bold ${
                  trustScoreColor === 'green' ? 'text-green-400' :
                  trustScoreColor === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {profileData.trustScore || profileData.riskScore || JACOB_DOE_PERSONA.trustScore}
              </motion.span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full ${
                  trustScoreColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  trustScoreColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${profileData.trustScore || profileData.riskScore || JACOB_DOE_PERSONA.trustScore}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
            
            <p className="text-xs text-white/60 mt-1">
              {userData ? 'AI-verified identity builds trust' : 'Verified identity builds trust'}
            </p>
          </motion.div>
        )}

        {/* Contact Info */}
        <div className="space-y-3">
          {[
            { icon: Mail, value: profileData.email },
            { icon: Phone, value: profileData.phone },
            { icon: MapPin, value: profileData.address }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 text-white/90"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              whileHover={{ x: 5 }}
            >
              <item.icon className="w-4 h-4 text-white/70" />
              <span className="text-sm">{item.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Claims Stats - Using MCP data when available, fallback to centralized data */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <motion.div 
              className="text-xl font-bold text-white"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              {profileData.totalClaims || JACOB_DOE_PERSONA.totalClaims}
            </motion.div>
            <div className="text-xs text-white/70">Total Claims</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <motion.div 
              className="text-xl font-bold text-emerald-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            >
              {profileData.successfulClaims || JACOB_DOE_PERSONA.successfulClaims}
            </motion.div>
            <div className="text-xs text-white/70">Successful</div>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-white/60 italic">
            "Secure claims through verified identity"
          </p>
          {userData && (
            <p className="text-xs text-blue-400 mt-1">
              • Powered by Azure AI
            </p>
          )}
        </motion.div>
      </div>
    </HolographicCard>
  );
}; 