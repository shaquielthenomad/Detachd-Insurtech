import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Checkbox';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { ClaimStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ClaimsStorageService } from '../../services/claimsStorage';

export const DeclarationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const claimData = location.state?.claimData || {}; 
  const documents = location.state?.documents || [];
  const verificationData = location.state?.verificationData || null;
  const fraudAlerts = location.state?.fraudAlerts || [];
  const documentFlags = location.state?.documentFlags || [];
  const riskScore = location.state?.riskScore || 25;

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const generateClaimNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DET-${timestamp.toString().slice(-6)}${random}`;
  };

  const handleSubmitClaim = async () => {
    setError('');
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions to submit your claim.');
      return;
    }
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const claimNumber = generateClaimNumber();
      
      // Use the ClaimsStorageService to store the claim
      const storedClaim = ClaimsStorageService.storeClaim({
        claimNumber,
        policyholderName: user?.name || claimData.fullName || 'Unknown',
        dateOfLoss: claimData.dateOfLoss,
        claimType: claimData.claimType,
        status: riskScore > 70 ? ClaimStatus.IN_REVIEW : ClaimStatus.SUBMITTED,
        amountClaimed: parseFloat(claimData.estimatedAmount || '0'),
        location: claimData.location,
        description: claimData.incidentDescription,
        policyNumber: claimData.policyNumber,
        riskScore,
        fraudAlerts,
        documentFlags,
        verificationData,
        isInsuranceClaim: true,
        priority: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
      });

      // Store by user as well for easier retrieval
      if (user?.id) {
        const userClaims = JSON.parse(localStorage.getItem(`user_claims_${user.id}`) || '[]');
        userClaims.unshift(storedClaim);
        localStorage.setItem(`user_claims_${user.id}`, JSON.stringify(userClaims));
      }
      
      setIsLoading(false);
      
      navigate(ROUTES.NEW_CLAIM_SUCCESS, { 
        state: { 
          claimNumber,
          claimData: storedClaim,
          message: `Your claim has been submitted successfully! ${
            riskScore > 70 
              ? 'Due to the risk assessment, it will undergo enhanced review.' 
              : 'It is now being processed by our team.'
          }`
        } 
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('An error occurred while submitting your claim. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Declaration and Submission" 
        subtitle="Step 4 of 4: Review and submit your claim."
        showBackButton
      />
      
      {/* Claim Summary */}
      <PixelCard variant="blue" className="mb-6">
        <h3 className="text-lg font-semibold text-text-on-dark-primary mb-4">Claim Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-on-dark-secondary">Claim Type:</span>
            <span className="text-text-on-dark-primary font-medium ml-2">{claimData.claimType}</span>
          </div>
          <div>
            <span className="text-text-on-dark-secondary">Date of Loss:</span>
            <span className="text-text-on-dark-primary font-medium ml-2">{claimData.dateOfLoss}</span>
          </div>
          <div>
            <span className="text-text-on-dark-secondary">Estimated Amount:</span>
            <span className="text-text-on-dark-primary font-medium ml-2">R{claimData.estimatedAmount}</span>
          </div>
          <div>
            <span className="text-text-on-dark-secondary">Risk Score:</span>
            <span className={`font-medium ml-2 ${
              riskScore > 70 ? 'text-red-400' : 
              riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
            }`}>{riskScore}%</span>
          </div>
        </div>
        
        {(fraudAlerts.length > 0 || documentFlags.length > 0) && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
            <p className="text-yellow-300 text-sm font-medium">⚠️ Enhanced Review Required</p>
            <p className="text-yellow-200 text-xs mt-1">
              This claim has been flagged for additional verification due to risk indicators.
            </p>
          </div>
        )}
      </PixelCard>
      
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