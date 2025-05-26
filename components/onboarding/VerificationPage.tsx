import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { ROUTES } from '../../constants';
import { UserRole } from '../../types';

export const VerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole | undefined;

  let title = "Verify your credentials";
  let description = "To ensure the safety and security of our community, we require all users to verify their credentials. This process may involve redirecting you to a government or organizational portal or performing an API-based check.";
  let primaryButtonText = "Start Verification";
  let secondaryButtonText: string | null = null;
  let secondaryAction = () => {};

  if (role === UserRole.GOVERNMENT_OFFICIAL) {
    title = "Verify credentials as Government Official";
    description = "To access Detachd as a Government Official, we need to verify your credentials. This ensures security and integrity. You may be redirected to an official portal (e.g., gov.za).";
    primaryButtonText = "Verify with gov.za";
    secondaryButtonText = "Verify Manually";
    secondaryAction = () => navigate(ROUTES.ONBOARDING_ADDITIONAL_INFO, { state: { role, manualVerification: true } });
  } else if (role === UserRole.INSURER_PARTY) {
     title = "Verify credentials as an Insurer Party";
     description = "To proceed as an Insurer Party, we need to verify your credentials against your organization's system. This ensures secure access and compliance.";
  } else if (role === UserRole.RESPONDER) {
    title = "Verify your Responder Status";
    description = "You will be redirected to a verification portal or asked to provide specific credentials to confirm your responder status.";
  }

  const handleStartVerification = () => {
    navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { state: { verificationType: role || 'general', inProgress: true, userRole: role } });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader title={title} showBackButton />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <p className="text-sm text-text-on-dark-secondary mb-6">{description}</p>
          
          <div className="space-y-4">
            <Button 
              type="button" 
              className="w-full" 
              onClick={handleStartVerification}
            >
              {primaryButtonText}
            </Button>
            {secondaryButtonText && (
                <Button 
                    type="button" 
                    variant="outline"
                    className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30" 
                    onClick={secondaryAction}
                >
                    {secondaryButtonText}
                </Button>
            )}
          </div>
          
          <p className="mt-6 text-xs text-slate-400 text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </p>
        </PixelCard>
      </div>
    </div>
  );
};