import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Checkbox';
import { ROUTES, MOCK_DELAY } from '../../constants';

export const DeclarationPage: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const claimData = location.state?.claimData || {}; 
  // const documents = location.state?.documents || [];

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmitClaim = async () => {
    setError('');
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions to submit your claim.');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    setIsLoading(false);
    
    navigate(ROUTES.NEW_CLAIM_SUCCESS, { state: { claimNumber: `CN-${Date.now()}` } });
  };

  return (
    <div>
      <PageHeader 
        title="Declaration and Submission" 
        subtitle="Step 3 of 3: Review and submit your claim."
        showBackButton
      />
      
      <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
        <h3 className="text-lg font-medium text-text-on-dark-primary mb-4">Declaration Statement</h3>
        <div className="prose prose-sm max-w-none text-text-on-dark-secondary prose-p:text-text-on-dark-secondary prose-strong:text-text-on-dark-primary">
          <p>
            I confirm that I am the policyholder / authorized representative for this claim and that the information I have provided is true and accurate to the best of my knowledge. I understand that providing false or misleading information may result in the rejection of my claim or other legal consequences.
          </p>
          <p>
            I consent to Detachd processing my claim and sharing relevant information with third parties (such as repair services, investigators, or other insurers) as necessary for the assessment and resolution of my claim, in accordance with the Detachd Privacy Policy and Terms of Service.
          </p>
          <p>
            I understand that this submission constitutes a formal claim and that Detachd will proceed with its review based on the information and documents provided.
          </p>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-6">
          <Checkbox
            id="agree-terms"
            label="I agree to the above declaration and the Terms and Conditions."
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            // Checkbox label style adjustment for dark background
            containerClassName="[&>div>label]:text-text-on-dark-secondary"
          />
        </div>

        {error && <p className="text-sm text-red-400 my-4">{error}</p>}

        <div className="mt-8 flex justify-between">
           <Button variant="outline" className="border-slate-400 text-slate-300 hover:bg-slate-700/30" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button 
            onClick={handleSubmitClaim} 
            isLoading={isLoading} 
            disabled={!agreedToTerms}
          >
            Submit Claim
          </Button>
        </div>
      </PixelCard>
    </div>
  );
};