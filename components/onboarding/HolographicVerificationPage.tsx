import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HolographicCard } from '../common/HolographicCard';
import { VerificationBadge } from '../common/VerificationBadge';
import { Button } from '../common/Button';
import { PageHeader } from '../common/PageHeader';
import { ROUTES } from '../../constants';
import { UserRole } from '../../types';
import { Shield, Scan, Eye, Lock, Globe, Award } from 'lucide-react';

export const HolographicVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole | undefined;
  const [currentStep, setCurrentStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Step progression for dramatic effect
  const verificationSteps = [
    "Initializing secure verification protocols...",
    "Establishing encrypted connection to verification network...",
    "Scanning identity credentials...",
    "Cross-referencing with official databases...",
    "Validating biometric markers...",
    "Finalizing security clearance..."
  ];

  useEffect(() => {
    if (isScanning && currentStep < verificationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isScanning, verificationSteps.length]);

  const getRoleConfig = (role: UserRole | undefined) => {
    switch (role) {
      case UserRole.GOVERNMENT_OFFICIAL:
        return {
          title: "Government Official Verification",
          description: "Advanced biometric and credential verification for official government access",
          variant: "trust" as const,
          badgeType: "trusted" as const,
          icon: <Globe className="w-8 h-8" />,
          portalName: "gov.za",
          features: ["Biometric Scan", "Badge Verification", "Security Clearance", "Database Cross-Check"]
        };
      case UserRole.INSURER_PARTY:
        return {
          title: "Insurer Party Authorization", 
          description: "Enterprise-grade verification for insurance industry professionals",
          variant: "premium" as const,
          badgeType: "premium" as const,
          icon: <Award className="w-8 h-8" />,
          portalName: "Insurance Registry",
          features: ["License Verification", "Company Authentication", "Professional Standing", "Compliance Check"]
        };
      case UserRole.RESPONDER:
        return {
          title: "Emergency Responder Clearance",
          description: "Critical response verification for first responders and emergency personnel",
          variant: "claim" as const,
          badgeType: "verified" as const,
          icon: <Shield className="w-8 h-8" />,
          portalName: "Emergency Services",
          features: ["Response Clearance", "Emergency Credentials", "Field Authorization", "Priority Access"]
        };
      default:
        return {
          title: "Identity Verification",
          description: "Secure identity verification using advanced holographic scanning technology",
          variant: "verification" as const,
          badgeType: "verified" as const,
          icon: <Eye className="w-8 h-8" />,
          portalName: "Verification Portal",
          features: ["Identity Scan", "Document Verification", "Biometric Check", "Security Validation"]
        };
    }
  };

  const config = getRoleConfig(role);

  const handleStartVerification = () => {
    setIsScanning(true);
    setCurrentStep(0);
    
    // After all steps complete, navigate to verification status
    setTimeout(() => {
      navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
        state: { 
          verificationType: role || 'general', 
          inProgress: true, 
          userRole: role 
        } 
      });
    }, verificationSteps.length * 1500 + 1000);
  };

  const handleManualVerification = () => {
    navigate(ROUTES.ONBOARDING_ADDITIONAL_INFO, { 
      state: { role, manualVerification: true } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader title={config.title} showBackButton />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <HolographicCard variant={config.variant} animated={true}>
          <div className="text-center space-y-6">
            {/* Header with Icon */}
            <motion.div
              className="flex justify-center"
              animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                {config.icon}
              </div>
            </motion.div>

            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-lg mb-3">
                Holographic Verification
              </h2>
              <p className="text-white/90 drop-shadow-lg text-sm">
                {config.description}
              </p>
            </div>

            {/* Verification Status */}
            {isScanning ? (
              <div className="space-y-4">
                <motion.div
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Scan className="w-8 h-8 text-white/80" />
                </motion.div>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-white font-medium mb-2 text-sm">
                    {verificationSteps[currentStep]}
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-white/60 to-white/90"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / verificationSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons */}
                <Button 
                  type="button" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" 
                  onClick={handleStartVerification}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Start Holographic Verification
                </Button>
                
                {role === UserRole.GOVERNMENT_OFFICIAL && (
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full border-white/40 text-white/90 hover:bg-white/10" 
                    onClick={handleManualVerification}
                  >
                    Manual Verification Process
                  </Button>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <p className="text-xs text-white/70 text-center">
                🛡️ Secure verification powered by holographic technology
              </p>
            </div>
          </div>
        </HolographicCard>
      </div>
    </div>
  );
}; 