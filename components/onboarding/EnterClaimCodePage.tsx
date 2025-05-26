import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { APP_NAME, ROUTES } from '../../constants';

export const EnterClaimCodePage: React.FC = () => {
  const [claimCode, setClaimCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!claimCode.trim()) {
      setError('Please enter your claim code.');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Determine user type based on claim code prefix
    const codeUpper = claimCode.toUpperCase();
    
    if (codeUpper.startsWith('WIT-')) {
      // Witness claim code
      navigate(ROUTES.ONBOARDING_WITNESS_CLAIM_CODE, { state: { claimCode } });
    } else if (codeUpper.startsWith('MED-')) {
      // Medical professional code
      navigate(ROUTES.ONBOARDING_THIRD_PARTY_INFO, { state: { claimCode, userType: 'medical_professional' } });
    } else if (codeUpper.startsWith('FR-')) {
      // First responder code
      navigate(ROUTES.ONBOARDING_THIRD_PARTY_INFO, { state: { claimCode, userType: 'first_responder' } });
    } else if (codeUpper.startsWith('INS-')) {
      // Insurance adjuster code
      navigate(ROUTES.ONBOARDING_INSURANCE_CODE, { state: { claimCode } });
    } else if (codeUpper.startsWith('POL-')) {
      // Policyholder code
      navigate(ROUTES.ONBOARDING_THIRD_PARTY_INFO, { state: { claimCode, userType: 'policyholder' } });
    } else if (codeUpper === 'DEMO123' || codeUpper === 'VALID123') {
      // Demo codes - allow role selection
      navigate(ROUTES.ONBOARDING_ROLE_SELECTION, { state: { claimCode } });
    } else {
      setError('Invalid claim code. Please check the format and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        <PageHeader title="Let's get you connected to a claim." showBackButton backButtonPath={ROUTES.WELCOME}/>
        <div className="mt-8">
          <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
            <h2 className="text-center text-2xl font-bold text-text-on-dark-primary mb-2">
              Enter Your Claim Code
            </h2>
            <p className="text-center text-sm text-text-on-dark-secondary mb-6">
              Enter the claim code provided to you to access the relevant claim information.
            </p>
            
            {/* Code format examples */}
            <div className="mb-6 p-4 bg-dark rounded-lg border border-light">
              <p className="text-xs text-text-on-dark-secondary mb-2">Code formats & examples:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="text-text-on-dark-secondary">
                  <span className="text-blue-400">WIT-ABC123</span> - Witness
                </div>
                <div className="text-text-on-dark-secondary">
                  <span className="text-green-400">MED-XYZ789</span> - Medical Professional
                </div>
                <div className="text-text-on-dark-secondary">
                  <span className="text-red-400">FR-DEF456</span> - First Responder
                </div>
                <div className="text-text-on-dark-secondary">
                  <span className="text-purple-400">INS-GHI123</span> - Insurance Adjuster
                </div>
                <div className="text-text-on-dark-secondary">
                  <span className="text-yellow-400">POL-JKL789</span> - Policyholder
                </div>
                <div className="text-text-on-dark-secondary">
                  <span className="text-cyan-400">DEMO123</span> - Demo/Testing
                </div>
              </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Claim Code"
                id="claim-code"
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="e.g., WIT-ABC123, MED-XYZ789"
                required
                error={error}
                containerClassName="[&>label]:text-text-on-dark-secondary"
              />
              <div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Continue
                </Button>
              </div>
            </form>
            
            <div className="mt-6 pt-4 border-t border-light">
              <p className="text-xs text-text-on-dark-secondary text-center">
                Don't have a claim code? 
                <button 
                  onClick={() => navigate(ROUTES.ONBOARDING_ROLE_SELECTION)}
                  className="text-blue-400 hover:text-blue-300 ml-1"
                >
                  Create an account
                </button>
              </p>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};