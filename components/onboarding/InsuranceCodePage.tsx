import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ROUTES } from '../../constants';
import { UserRole } from '../../types';
import { ShieldCheckIcon, PlusCircleIcon } from '../common/Icon';

export const InsuranceCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole;
  
  const [insuranceCode, setInsuranceCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!insuranceCode.trim()) {
      setError('Please enter your insurance code.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    // Simulate code validation
    if (insuranceCode.length >= 6) {
      // Navigate to policy creation with pre-filled data
      navigate(ROUTES.NEW_POLICY, { 
        state: { 
          role, 
          insuranceCode,
          fromOnboarding: true 
        } 
      });
    } else {
      setError('Invalid insurance code. Please check and try again.');
    }
  };

  const handleManualProcess = () => {
    navigate(ROUTES.NEW_POLICY, { 
      state: { 
        role,
        manualEntry: true,
        fromOnboarding: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Get Started" 
        subtitle="How would you like to proceed?" 
        showBackButton 
        backButtonPath={ROUTES.ONBOARDING_ROLE_SELECTION}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        {/* Recommended: Insurance Code */}
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-text-on-dark-primary">
              Have an Insurance Code?
            </h3>
            <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Recommended
            </span>
          </div>
          
          <p className="text-sm text-text-on-dark-secondary mb-4">
            Enter the code provided by your insurer for faster setup and pre-filled information.
          </p>
          
          <form onSubmit={handleSubmitWithCode} className="space-y-4">
            <Input
              label="Insurance Code"
              value={insuranceCode}
              onChange={(e) => setInsuranceCode(e.target.value)}
              placeholder="e.g., INS-2024-ABC123"
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              Continue with Code
            </Button>
          </form>
        </PixelCard>

        {/* Alternative: Manual Entry */}
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="flex items-center mb-4">
            <PlusCircleIcon className="h-6 w-6 text-slate-400 mr-2" />
            <h3 className="text-lg font-semibold text-text-on-dark-primary">
              Start Without Code
            </h3>
          </div>
          
          <p className="text-sm text-text-on-dark-secondary mb-4">
            Don't have a code? No problem. You can still apply for a new policy by providing your information manually.
          </p>
          
          <Button 
            variant="outline" 
            className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30"
            onClick={handleManualProcess}
          >
            Continue Manually
          </Button>
        </PixelCard>
        
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Both options will guide you through the policy application process securely.
          </p>
        </div>
      </div>
    </div>
  );
}; 