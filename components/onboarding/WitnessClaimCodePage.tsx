import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { EyeIcon, AlertTriangleIcon } from '../common/Icon';

export const WitnessClaimCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole;
  
  const [claimCode, setClaimCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [witnessInfo, setWitnessInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleClaimCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!claimCode.trim()) {
      setError('Please enter the claim code provided to you.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    setIsLoading(false);

    // Simulate code validation
    if (claimCode.length >= 6) {
      setShowConfirmation(true);
    } else {
      setError('Invalid claim code. Please check with the policyholder or adjuster.');
    }
  };

  const handleWitnessInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWitnessInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFinalSubmit = async () => {
    if (!witnessInfo.name || !witnessInfo.email) {
      setError('Name and email are required to proceed.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // Navigate to a witness statement submission success page
    navigate(ROUTES.CLAIM_SUCCESS, { 
      state: { 
        claimNumber: `WITNESS-${claimCode}`,
        isWitness: true,
        message: 'Your witness statement has been submitted and added to the claim audit trail.',
        redirectTo: ROUTES.WELCOME,
        redirectText: 'Return to Home'
      } 
    });
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader 
          title="Witness Statement Submission" 
          subtitle="Confirm your details before submitting"
        />
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
            <div className="space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-200 mb-1">Legal Declaration</h4>
                    <p className="text-sm text-yellow-300">
                      By submitting this witness statement, you declare that the information provided is true and accurate to the best of your knowledge. 
                      This statement will become part of the official claim record and audit trail.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={witnessInfo.name}
                  onChange={handleWitnessInfoChange}
                  placeholder="Enter your full name"
                  required
                  containerClassName="[&>label]:text-text-on-dark-secondary"
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={witnessInfo.email}
                  onChange={handleWitnessInfoChange}
                  placeholder="your.email@example.com"
                  required
                  containerClassName="[&>label]:text-text-on-dark-secondary"
                />
                
                <Input
                  label="Phone Number (Optional)"
                  name="phone"
                  type="tel"
                  value={witnessInfo.phone}
                  onChange={handleWitnessInfoChange}
                  placeholder="+27 XX XXX XXXX"
                  containerClassName="[&>label]:text-text-on-dark-secondary"
                />
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-sm text-slate-300">
                  <strong>Claim Code:</strong> {claimCode}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Your statement will be linked to this claim and shared with the policyholder and insurer.
                </p>
              </div>
              
              {error && <p className="text-sm text-red-400">{error}</p>}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleFinalSubmit}
                  className="w-full" 
                  isLoading={isLoading}
                >
                  Submit Witness Statement
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-300 hover:bg-slate-700"
                  onClick={() => setShowConfirmation(false)}
                >
                  Back to Claim Code
                </Button>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Witness Statement" 
        subtitle="Enter the claim code to proceed with your statement"
        showBackButton 
        backButtonPath={ROUTES.ONBOARDING_ROLE_SELECTION}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <EyeIcon className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary">
                Witness Access
              </h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary">
              Enter the claim code provided by the policyholder or insurance adjuster to submit your witness statement.
            </p>
          </div>
          
          <form onSubmit={handleClaimCodeSubmit} className="space-y-4">
            <Input
              label="Claim Code"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              placeholder="e.g., CLM-2024-ABC123"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              Continue with Claim Code
            </Button>
          </form>
          
          <div className="mt-6 bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-200 mb-2">As a Witness:</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• You will not have access to a dashboard</li>
              <li>• Your statement will be added to the main claim</li>
              <li>• You'll receive confirmation once submitted</li>
              <li>• No approval required - immediate submission</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Don't have a claim code? Contact the policyholder or their insurance company.
            </p>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}; 