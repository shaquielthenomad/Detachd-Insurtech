import React, { useEffect, useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { User, Claim, ClaimStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { MailIcon, PhoneIcon, MapPinIcon, ShieldCheckIcon, HistoryIcon, XMarkIcon, InfoIcon, UserCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { MOCK_DELAY } from '../../constants';

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

// Risk Assessment Modal Component
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
  const riskLevel = riskScore >= 80 ? 'Low' : riskScore >= 60 ? 'Medium' : 'High';
  const riskColor = riskScore >= 80 ? 'text-green-400' : riskScore >= 60 ? 'text-yellow-400' : 'text-red-400';

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
                <span className={`text-2xl font-bold ${riskColor}`}>{riskScore}</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">
                Overall Risk Score: {riskScore}/100
              </h4>
              <p className={`text-sm font-medium ${riskColor}`}>
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
                      riskScore >= 80 ? 'bg-green-400' : riskScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
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
                    <span className="text-green-400 text-sm font-medium">None</span>
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

const mockUserClaimsHistory: Claim[] = [
  { id: 'ch1', claimNumber: '2023-001', policyholderName: '', dateOfLoss: '2023-01-15', claimType: 'Auto Accident', status: ClaimStatus.APPROVED, amountClaimed: 5000 },
  { id: 'ch2', claimNumber: '2022-003', policyholderName: '', dateOfLoss: '2022-08-20', claimType: 'Home Damage', status: ClaimStatus.CLOSED, amountClaimed: 10000 },
];

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

  useEffect(() => {
    const fetchProfileData = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        if (authUser) {
            // Only add risk score and claims history for non-insurer users
            const isInsurer = authUser.role === 'insurer_admin' || authUser.role === 'super_admin';
            
            setProfileData({
                ...authUser,
                name: authUser.name || "Jacob Doe",
                email: authUser.email || "j.doe@gmail.com",
                role: authUser.role,
                avatarUrl: authUser.avatarUrl || `https://picsum.photos/seed/${authUser.email || "jacob.doe"}/200/200`,
                address: "145 Long Street, Cape Town, 8001",
                phone: "084 497 6894",
                // Only include claims history and risk score for non-insurer users
                claimsHistory: isInsurer ? [] : mockUserClaimsHistory.map(c => ({...c, policyholderName: authUser.name || "Jacob Doe"})),
                riskAssessmentScore: isInsurer ? undefined : 75,
            });
        }
        setIsLoading(false);
    };
    fetchProfileData();
  }, [authUser]);

  if (isLoading || !profileData) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  // Check if user is an insurer
  const isInsurer = profileData.role === 'insurer_admin' || profileData.role === 'super_admin';

  return (
    <div>
      <PageHeader title="User Profile" subtitle={profileData.role ? `Role: ${profileData.role}` : ""} />
      
      {/* Risk Assessment Modal - Only show for non-insurer users */}
      {!isInsurer && profileData.riskAssessmentScore !== undefined && (
        <RiskAssessmentModal 
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          riskScore={profileData.riskAssessmentScore}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PixelCard variant="blue" className="text-center" contentClassName="flex flex-col items-center">
            <img 
              src={profileData.avatarUrl} 
              alt={`${profileData.name} avatar`}
              className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border-4 border-slate-700"
            />
            <h2 className="text-2xl font-semibold text-text-on-dark-primary">{profileData.name}</h2>
            <p className="text-md text-text-on-dark-secondary">{profileData.role}</p>
            {profileData.id && <p className="text-xs text-slate-400 mt-1">ID: {profileData.id}</p>}
            
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
              <p className="text-xs text-slate-400 mt-2 text-center max-w-[140px]">
                Share with first responders for quick access to your profile
              </p>
            </div>
          </PixelCard>
        </div>

        <div className="md:col-span-2 space-y-6">
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
          
          {/* Risk Assessment - Only show for non-insurer users */}
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
                    <p className={`text-2xl font-bold ${profileData.riskAssessmentScore > 70 ? 'text-red-400' : profileData.riskAssessmentScore > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {profileData.riskAssessmentScore}/100
                    </p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Click for detailed risk factor analysis</p>
             </PixelCard>
          )}
        </div>
      </div>
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