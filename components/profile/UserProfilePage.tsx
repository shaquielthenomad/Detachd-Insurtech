import React, { useEffect, useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { User, Claim, ClaimStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { MailIcon, PhoneIcon, MapPinIcon, ShieldCheckIcon, HistoryIcon, XMarkIcon, InfoIcon, UserCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { MOCK_DELAY, JACOB_DOE_PERSONA, getRiskScoreColor, getRiskLevel } from '../../constants';
import { HolographicUserProfile } from './HolographicUserProfile';
import { mcpClient } from '../../services/mcpClient';

// Simple QR Code component using QR Server API
const QRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 120 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrUrl} 
        alt="QR Code" 
        className="border border-slate-600 rounded-lg mx-auto"
        width={size}
        height={size}
      />
    </div>
  );
};

// Risk Assessment Modal Component - Now using centralized risk score
const RiskAssessmentModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  riskScore: number; 
}> = ({ isOpen, onClose, riskScore }) => {
  if (!isOpen) return null;

  const getRiskFactors = (score: number) => {
    if (score >= 80) return [
      'Excellent driving record with no recent incidents',
      'Long-term customer with consistent payment history', 
      'Vehicle equipped with advanced safety features',
      'Low-risk geographic location',
      'Responsible social media activity patterns'
    ];
    if (score >= 60) return [
      'Good driving record with minor infractions',
      'Moderate claim history',
      'Vehicle age and condition within acceptable range',
      'Average geographic risk factors'
    ];
    return [
      'Multiple recent claims or incidents',
      'High-risk driving patterns detected',
      'Vehicle modifications or high-risk usage',
      'Geographic location with elevated risk factors',
      'Inconsistent payment or documentation history'
    ];
  };

  const riskFactors = getRiskFactors(riskScore);
  const riskLevel = getRiskLevel(riskScore);
  const riskColor = getRiskScoreColor(riskScore);
  const riskColorClass = riskColor === 'green' ? 'text-green-400' : riskColor === 'yellow' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">AI Risk Assessment</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            {/* Risk Score */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-slate-700 mb-4">
                <span className={`text-2xl font-bold ${riskColorClass}`}>{riskScore}</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">
                Overall Risk Score: {riskScore}/100
              </h4>
              <p className={`text-sm font-medium ${riskColorClass}`}>
                {riskLevel} Risk Profile
              </p>
            </div>

            {/* Risk Factors */}
            <div>
              <h5 className="text-md font-medium text-white mb-6">Key Risk Factors</h5>
              <div className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-sm mt-2 flex-shrink-0 ${
                      riskColor === 'green' ? 'bg-green-400' : riskColor === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <p className="text-sm text-slate-300 leading-relaxed">{factor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Details */}
            <div>
              <h5 className="text-md font-medium text-white mb-6">Assessment Breakdown</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 p-6 rounded-lg">
                  <h6 className="text-sm font-medium text-slate-400 mb-3">Driving Behavior</h6>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Speed Compliance</span>
                    <span className="text-green-400 text-sm font-medium">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Harsh Events</span>
                    <span className="text-green-400 text-sm font-medium">Very Low</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Night Driving</span>
                    <span className="text-yellow-400 text-sm font-medium">Moderate</span>
                  </div>
                </div>
                
                <div className="bg-slate-700/30 p-6 rounded-lg">
                  <h6 className="text-sm font-medium text-slate-400 mb-3">Claims History</h6>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Recent Claims</span>
                    <span className="text-green-400 text-sm font-medium">Minimal</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Claim Frequency</span>
                    <span className="text-green-400 text-sm font-medium">Low</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Fraud Indicators</span>
                    <span className="text-green-400 text-sm font-medium">None</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <h5 className="text-md font-medium text-blue-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Recommendations
              </h5>
              <div className="space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  • Continue maintaining your excellent driving record to qualify for additional discounts
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  • Consider installing additional safety features for further premium reductions
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  • Your risk profile qualifies you for our preferred customer benefits program
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-700 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UserProfileData extends User {
    address?: string;
    phone?: string;
    claimsHistory?: Claim[];
    riskAssessmentScore?: number;
}

export const UserProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dataSource, setDataSource] = useState<'mcp' | 'fallback'>('mcp');

  useEffect(() => {
    const fetchProfileData = async () => {
        setIsLoading(true);
        
        // Check MCP server status first
        const isOnline = await mcpClient.healthCheck();
        setMcpStatus(isOnline ? 'online' : 'offline');
        
        if (authUser) {
            const isInsurer = authUser.role === 'insurer_admin' || authUser.role === 'super_admin';
            
            try {
                if (isOnline) {
                    // Try to get real data from MCP servers
                    console.log('🚀 Fetching real data from Azure MCP servers...');
                    
                    const comprehensiveData = await mcpClient.getComprehensiveUserData(authUser.id);
                    
                    setProfileData({
                        ...comprehensiveData.profile,
                        role: authUser.role, // Preserve auth role
                        claimsHistory: isInsurer ? [] : comprehensiveData.claims,
                        riskAssessmentScore: isInsurer ? undefined : comprehensiveData.riskAssessment?.riskScore,
                    });
                    
                    setDataSource('mcp');
                    console.log('✅ Successfully loaded data from Azure services');
                } else {
                    throw new Error('MCP servers unavailable');
                }
            } catch (error) {
                console.warn('⚠️ MCP servers unavailable, falling back to local data:', error);
                
                // Fallback to local data with Jacob Doe persona
                setProfileData({
                    ...authUser,
                    id: JACOB_DOE_PERSONA.id,
                    name: JACOB_DOE_PERSONA.name,
                    email: JACOB_DOE_PERSONA.email,
                    role: authUser.role,
                    avatarUrl: JACOB_DOE_PERSONA.avatarUrl,
                    address: JACOB_DOE_PERSONA.address,
                    phone: JACOB_DOE_PERSONA.phone,
                    claimsHistory: isInsurer ? [] : [
                        { id: 'ch1', claimNumber: '2023-001', policyholderName: JACOB_DOE_PERSONA.name, dateOfLoss: '2023-01-15', claimType: 'Auto Accident', status: ClaimStatus.APPROVED, amountClaimed: 5000 },
                        { id: 'ch2', claimNumber: '2022-003', policyholderName: JACOB_DOE_PERSONA.name, dateOfLoss: '2022-08-20', claimType: 'Home Damage', status: ClaimStatus.CLOSED, amountClaimed: 10000 },
                    ],
                    riskAssessmentScore: isInsurer ? undefined : JACOB_DOE_PERSONA.riskScore,
                });
                
                setDataSource('fallback');
                setMcpStatus('offline');
            }
        }
        
        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        setIsLoading(false);
    };
    
    fetchProfileData();
  }, [authUser]);

  if (isLoading || !profileData) {
    return <LoadingSpinner message={mcpStatus === 'checking' ? "Connecting to Azure services..." : "Loading profile..."} />;
  }

  // Check if user is an insurer
  const isInsurer = profileData.role === 'insurer_admin' || profileData.role === 'super_admin';

  return (
    <div>
      <PageHeader 
        title="User Profile" 
        subtitle={
          <div className="flex items-center gap-2">
            <span>{profileData.role ? `Role: ${profileData.role}` : ""}</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${mcpStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-xs text-slate-400">
                {mcpStatus === 'online' ? 'Azure Connected' : 'Local Data'}
              </span>
            </div>
          </div>
        }
      />
      
      {/* Data Source Indicator */}
      {dataSource === 'fallback' && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-yellow-400" />
            <p className="text-sm text-yellow-200">
              Currently showing demo data. Azure MCP services are offline.
            </p>
          </div>
        </div>
      )}
      
      {/* Click hint */}
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-400">
          💡 Click the profile card to {isFlipped ? 'return to standard view' : 'see holographic view'}
        </p>
      </div>
      
      {/* Risk Assessment Modal - Only show for non-insurer users */}
      {!isInsurer && profileData.riskAssessmentScore !== undefined && (
        <RiskAssessmentModal 
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          riskScore={profileData.riskAssessmentScore}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flip Card Container */}
          <div className="lg:col-span-1">
            <div 
              className="flip-card cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: '1000px', height: '600px' }}
            >
              <div 
                className={`flip-card-inner relative w-full h-full transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side - Standard Profile */}
                <div 
                  className="flip-card-front absolute inset-0 w-full h-full"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <PixelCard variant="blue" className="h-full hover:ring-2 hover:ring-blue-400/50 transition-all" contentClassName="flex flex-col items-center justify-center p-6">
                    <img 
                      src={profileData.avatarUrl} 
                      alt={`${profileData.name} avatar`}
                      className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border-4 border-slate-700"
                    />
                    <h2 className="text-2xl font-semibold text-text-on-dark-primary text-center">{profileData.name}</h2>
                    <p className="text-md text-text-on-dark-secondary text-center">{profileData.role}</p>
                    {profileData.id && <p className="text-xs text-slate-400 mt-1 text-center">ID: {profileData.id}</p>}
                    
                    <div className="mt-6 flex flex-col items-center">
                      <h3 className="text-sm font-medium text-text-on-dark-secondary mb-3 text-center">Emergency Contact QR</h3>
                      <QRCode 
                        value={JSON.stringify({
                          name: profileData.name,
                          id: profileData.id,
                          role: profileData.role,
                          phone: profileData.phone,
                          email: profileData.email
                        })} 
                        size={100}
                      />
                      <p className="text-xs text-slate-400 mt-2 text-center max-w-[200px]">
                        Share with first responders for quick access to your profile
                      </p>
                    </div>
                    
                    {/* Click indicator */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                        🔮 Click to see holographic view
                      </p>
                    </div>
                  </PixelCard>
                </div>

                {/* Back Side - Holographic Profile */}
                <div 
                  className="flip-card-back absolute inset-0 w-full h-full"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="h-full relative">
                    <HolographicUserProfile 
                      variant="full" 
                      showTrustScore={!isInsurer}
                      className="h-full hover:ring-2 hover:ring-blue-400/50 transition-all"
                      userData={dataSource === 'mcp' ? profileData : undefined}
                    />
                    {/* Click indicator for back side */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                      <p className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                        📋 Click to return to standard view
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Information */}
          <div className="lg:col-span-2 space-y-6">
            <PixelCard variant="blue" title="Personal Information" icon={<UserCircleIcon className="h-5 w-5 text-blue-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary">Full Name</label>
                  <p className="mt-1 text-text-on-dark-primary">{profileData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary">Email</label>
                  <p className="mt-1 text-text-on-dark-primary">{profileData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary">Phone</label>
                  <p className="mt-1 text-text-on-dark-primary">{profileData.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary">Role</label>
                  <p className="mt-1 text-text-on-dark-primary">{profileData.role}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-on-dark-secondary">Address</label>
                  <p className="mt-1 text-text-on-dark-primary">{profileData.address}</p>
                </div>
              </div>
            </PixelCard>
            
            {/* Claims History - Only show for non-insurer users */}
            {!isInsurer && profileData.claimsHistory && profileData.claimsHistory.length > 0 && (
              <PixelCard variant="blue" title="Claims History" icon={<HistoryIcon className="h-5 w-5 text-blue-400" />}>
                <ul className="divide-y divide-slate-700">
                  {profileData.claimsHistory.map(claim => (
                    <li key={claim.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-blue-300 hover:underline cursor-pointer">Claim #{claim.claimNumber}</p>
                          <p className="text-xs text-text-on-dark-secondary">{claim.claimType} - {new Date(claim.dateOfLoss).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text-on-dark-primary">${claim.amountClaimed?.toLocaleString()}</p>
                          <p className={`text-xs font-medium ${claim.status === ClaimStatus.APPROVED ? 'text-green-400' : 'text-slate-400'}`}>{claim.status}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </PixelCard>
            )}
            
            {/* Risk Assessment - Only show for non-insurer users, now with consistent scoring */}
            {!isInsurer && profileData.riskAssessmentScore !== undefined && (
               <PixelCard 
                 variant="blue" 
                 title="Risk Assessment" 
                 icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
                 className="cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all"
                 onClick={() => setShowRiskModal(true)}
               >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm text-text-on-dark-secondary">Current Risk Score:</p>
                        <InfoIcon className="h-4 w-4 text-blue-400 ml-2" />
                      </div>
                      <p className={`text-2xl font-bold ${
                        getRiskScoreColor(profileData.riskAssessmentScore) === 'green' ? 'text-green-400' :
                        getRiskScoreColor(profileData.riskAssessmentScore) === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                          {profileData.riskAssessmentScore}/100
                      </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Click for detailed risk factor analysis 
                    {dataSource === 'mcp' && <span className="text-green-400"> • AI-Powered</span>}
                  </p>
               </PixelCard>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .flip-card-inner {
          transform-style: preserve-3d;
        }
        
        .flip-card-front,
        .flip-card-back {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

const InfoRow: React.FC<{icon: React.ReactNode, label: string, value: string}> = ({icon, label, value}) => (
    <div className="flex">
        <dt className="w-1/3 text-sm font-medium text-text-on-dark-secondary flex items-center">
            {icon} <span className="ml-2">{label}</span>
        </dt>
        <dd className="w-2/3 mt-1 text-sm text-text-on-dark-primary sm:mt-0">{value}</dd>
    </div>
);