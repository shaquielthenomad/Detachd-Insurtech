import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { ROUTES, APP_NAME } from '../../constants';
import { UserRole } from '../../types';
import { ChevronRightIcon } from '../common/Icon';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

const roleOptions: RoleOption[] = [
  { value: UserRole.POLICYHOLDER, label: 'Policyholder', description: 'I am an existing policyholder making a claim.' },
  { value: UserRole.THIRD_PARTY, label: 'Third Party', description: 'I was involved in an incident with a policyholder.' },
  { value: UserRole.WITNESS, label: 'Witness', description: 'I witnessed an incident and need to provide information.' },
  { value: UserRole.RESPONDER, label: 'First Responder', description: 'I am a police officer, firefighter, or other official responder.' },
  { value: UserRole.INSURER_PARTY, label: 'Insurer / Adjuster', description: 'I am an employee or representative of the insurance company.' },
  { value: UserRole.GOVERNMENT_OFFICIAL, label: 'Government Official', description: 'I require access for official government purposes (e.g., gov.za verification).' },
];

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [useHolographicVerification, setUseHolographicVerification] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  const handleContinue = () => {
    if (!selectedRole) {
      setError('Please select your role to continue.');
      return;
    }
    
    // For Government Officials and Responders, check if holographic verification is enabled
    const shouldUseHolographic = useHolographicVerification && 
      (selectedRole === UserRole.GOVERNMENT_OFFICIAL || selectedRole === UserRole.RESPONDER);
    
    switch (selectedRole) {
        case UserRole.POLICYHOLDER:
            navigate(ROUTES.ONBOARDING_INSURANCE_CODE, { state: { role: selectedRole }});
            break;
        case UserRole.THIRD_PARTY:
            navigate(ROUTES.ONBOARDING_THIRD_PARTY_INFO, { state: { role: selectedRole }});
            break;
        case UserRole.WITNESS:
            navigate(ROUTES.ONBOARDING_WITNESS_CLAIM_CODE, { state: { role: selectedRole }});
            break;
        case UserRole.INSURER_PARTY:
            navigate(ROUTES.ONBOARDING_INSURER_DEPARTMENT, { state: { role: selectedRole }});
            break;
        case UserRole.GOVERNMENT_OFFICIAL:
        case UserRole.RESPONDER:
            if (shouldUseHolographic) {
                navigate(ROUTES.ONBOARDING_HOLOGRAPHIC_VERIFICATION, { state: { role: selectedRole }});
            } else {
            navigate(ROUTES.ONBOARDING_VERIFICATION, { state: { role: selectedRole }});
            }
            break;
        default:
            navigate(ROUTES.ONBOARDING_ADDITIONAL_INFO, { state: { role: selectedRole }});
            break;
    }
  };

  // Check if selected role supports holographic verification
  const supportsHolographic = selectedRole === UserRole.GOVERNMENT_OFFICIAL || selectedRole === UserRole.RESPONDER;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader title="Account Setup" subtitle="Please tell us your role to get started with the right experience." showBackButton backButtonPath={ROUTES.WELCOME} />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <h2 className="text-xl font-semibold text-text-on-dark-primary mb-1">Select Your Role</h2>
          <p className="text-sm text-text-on-dark-secondary mb-6">Choose the option that best describes your relationship to insurance claims.</p>
          
          <div className="space-y-4">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRoleSelect(option.value)}
                className={`w-full text-left p-4 border rounded-lg transition-all duration-150 ease-in-out
                  ${selectedRole === option.value 
                    ? 'border-blue-400 ring-2 ring-blue-400 bg-blue-700/30' // Adjusted selected style for dark card
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-md font-medium ${selectedRole === option.value ? 'text-blue-200' : 'text-text-on-dark-primary'}`}>{option.label}</h3>
                    <p className={`text-sm mt-1 ${selectedRole === option.value ? 'text-blue-300' : 'text-text-on-dark-secondary'}`}>{option.description}</p>
                  </div>
                  <ChevronRightIcon className={`h-5 w-5 flex-shrink-0 ${selectedRole === option.value ? 'text-blue-300' : 'text-slate-400'}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Holographic Verification Toggle */}
          {supportsHolographic && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-200">🔮 Holographic Verification</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Experience next-generation identity verification with immersive holographic UI
                  </p>
                </div>
                <button
                  onClick={() => setUseHolographicVerification(!useHolographicVerification)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    useHolographicVerification ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useHolographicVerification ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

          <div className="mt-8">
            <Button 
              type="button" 
              className="w-full" 
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              Continue
            </Button>
          </div>
        </PixelCard>
      </div>
    </div>
  );
};