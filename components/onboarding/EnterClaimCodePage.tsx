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

    if (claimCode === "VALID123") { 
      navigate(ROUTES.ONBOARDING_ROLE_SELECTION); 
    } else {
      setError('Invalid claim code. Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        <PageHeader title="Let's get you connected to a claim." showBackButton backButtonPath={ROUTES.WELCOME}/>
        <div className="mt-8">
          <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
            <h2 className="text-center text-2xl font-bold text-text-on-dark-primary mb-2">
              Enter Your Claim Code
            </h2>
            <p className="text-center text-sm text-text-on-dark-secondary mb-6">
              If you have a claim code, please enter it below to proceed.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Claim Code"
                id="claim-code"
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Enter your claim code"
                required
                error={error} // Error text will be red, styled by Input component
                containerClassName="[&>label]:text-text-on-dark-secondary" // Ensure label is light
              />
              <div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Continue
                </Button>
              </div>
            </form>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};