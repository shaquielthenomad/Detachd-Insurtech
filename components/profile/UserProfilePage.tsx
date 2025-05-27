import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { User, Claim, ClaimStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { MailIcon, PhoneIcon, MapPinIcon, ShieldCheckIcon, HistoryIcon, XMarkIcon, InfoIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { MOCK_DELAY, ROUTES } from '../../constants';

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
    const factors = [
      { name: 'Claims History', impact: score > 70 ? 'High' : score > 50 ? 'Medium' : 'Low', description: 'Previous claims frequency and patterns', route: ROUTES.CLAIMS },
      { name: 'Verification Status', impact: 'Low', description: 'Complete identity and document verification', route: ROUTES.PROFILE },
      { name: 'Policy Duration', impact: 'Low', description: 'Length of time as policyholder', route: ROUTES.MY_POLICY },
      { name: 'Claim Complexity', impact: score > 60 ? 'Medium' : 'Low', description: 'Average complexity of submitted claims', route: ROUTES.ANALYTICS },
      { name: 'Geographic Risk', impact: 'Medium', description: 'Risk factors based on location', route: ROUTES.ANALYTICS },
      { name: 'Blockchain Verification', impact: 'Low', description: 'SecureAI blockchain verification score', route: ROUTES.CLAIM_VERIFICATION_CERTIFICATE },
    ];
    return factors;
  };

  const factors = getRiskFactors(riskScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-text-on-dark-primary">Risk Assessment Details</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-on-dark-secondary">Current Risk Score:</span>
                <span className={`text-3xl font-bold ${riskScore > 70 ? 'text-red-400' : riskScore > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {riskScore}/100
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {riskScore > 70 ? 'High Risk' : riskScore > 50 ? 'Medium Risk' : 'Low Risk'} - 
                {riskScore > 70 ? ' Additional verification may be required for claims' : 
                 riskScore > 50 ? ' Standard processing applies' : 
                 ' Expedited processing available'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-4">Risk Factors Analysis</h3>
              <div className="space-y-4">
                {factors.map((factor, index) => {
                  const content = (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-text-on-dark-primary">{factor.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          factor.impact === 'High' ? 'bg-red-900/30 text-red-300' :
                          factor.impact === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-green-900/30 text-green-300'
                        }`}>
                          {factor.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{factor.description}</p>
                    </>
                  );
                  return factor.route ? (
                    <Link to={factor.route} key={index} className="block bg-slate-700/20 p-4 rounded-lg hover:bg-slate-600/30 transition-colors" onClick={onClose}>
                      {content}
                    </Link>
                  ) : (
                    <div key={index} className="bg-slate-700/20 p-4 rounded-lg">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-200 mb-2">How to improve your risk score:</h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Maintain a clean claims history</li>
                <li>• Complete all verification steps promptly</li>
                <li>• Provide accurate and complete information</li>
                <li>• Use SecureAI blockchain verification features</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
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
            setProfileData({
                ...authUser,
                name: authUser.name || "Sophia Bennett",
                email: authUser.email,
                role: authUser.role,
                avatarUrl: authUser.avatarUrl || `https://picsum.photos/seed/${authUser.email}/200/200`,
                address: "123 Main St, Anytown, USA",
                phone: "(555) 123-4567",
                claimsHistory: mockUserClaimsHistory.map(c => ({...c, policyholderName: authUser.name || "Sophia Bennett"})),
                riskAssessmentScore: 75,
            });
        }
        setIsLoading(false);
    };
    fetchProfileData();
  }, [authUser]);

  if (isLoading || !profileData) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div>
      <PageHeader title="User Profile" subtitle={profileData.role ? `Role: ${profileData.role}` : ""} />
      
      {/* Risk Assessment Modal */}
      {profileData.riskAssessmentScore !== undefined && (
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
          <PixelCard variant="blue" title="Contact Information" icon={<MailIcon className="h-5 w-5 text-blue-400" />}>
            <dl className="space-y-3">
              {profileData.phone && (
                <InfoRow icon={<PhoneIcon className="h-5 w-5 text-slate-400" />} label="Phone" value={profileData.phone} />
              )}
              <InfoRow icon={<MailIcon className="h-5 w-5 text-slate-400" />} label="Email" value={profileData.email} />
              {profileData.address && (
                <InfoRow icon={<MapPinIcon className="h-5 w-5 text-slate-400" />} label="Address" value={profileData.address} />
              )}
            </dl>
          </PixelCard>

          {profileData.claimsHistory && profileData.claimsHistory.length > 0 && (
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
          
          {profileData.riskAssessmentScore !== undefined && (
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