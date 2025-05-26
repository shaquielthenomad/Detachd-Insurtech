import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { LivenessCheck } from '../common/LivenessCheck';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ClaimFormData {
  fullName: string;
  policyNumber: string;
  claimType: string;
  dateOfLoss: string;
  incidentDescription: string;
  thirdPartyAccessCode?: string;
}

interface VerificationData {
  photoDataUrl: string;
  timestamp: string;
}

export const StartClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ClaimFormData>({
    fullName: user?.name || '',
    policyNumber: '',
    claimType: '',
    dateOfLoss: '',
    incidentDescription: '',
    thirdPartyAccessCode: '',
  });
  const [currentStep, setCurrentStep] = useState(1); // Step management will be simple for now
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLivenessCheck, setShowLivenessCheck] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Submit claim data
      const claimData = {
        incidentDate: formData.dateOfLoss,
        location: '', // Assuming location is not provided in the form
        description: formData.incidentDescription,
        policyNumber: formData.policyNumber,
        claimType: formData.claimType,
        estimatedAmount: parseFloat(formData.estimatedAmount || '0'),
        witnesses: [], // Assuming witnesses are not provided in the form
        policeReportNumber: '', // Assuming police report number is not provided in the form
      };

      // Step 2: Run AI fraud detection analysis
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';
      const token = localStorage.getItem('detachd_token');
      
      // AI Analysis
      const aiResponse = await fetch(`${API_BASE_URL}/ai/analyze-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: formData.incidentDescription,
          claimType: formData.claimType,
          estimatedAmount: parseFloat(formData.estimatedAmount || '0'),
          location: '', // Assuming location is not provided in the form
          incidentDate: formData.dateOfLoss
        })
      });

      let riskScore = 25; // Default low risk
      let aiAnalysis = 'Standard claim processing';
      
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        riskScore = aiResult.riskScore || 25;
        aiAnalysis = aiResult.analysis || 'AI analysis completed';
      }

      // Step 3: Submit claim with AI analysis
      const claimResponse = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...claimData,
          riskScore,
          aiAnalysis,
          status: riskScore > 70 ? 'under_review' : 'pending'
        })
      });

      if (claimResponse.ok) {
        const result = await claimResponse.json();
        
        // Show AI analysis results
        if (riskScore > 70) {
          setError(`⚠️ Claim flagged for review (Risk Score: ${riskScore}%). Additional verification may be required.`);
        } else if (riskScore > 40) {
          setError(`ℹ️ Standard processing (Risk Score: ${riskScore}%). Your claim will be reviewed shortly.`);
        }
        
        navigate(`/claims/${result.claimId}/success`);
      } else {
        throw new Error('Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Failed to submit claim. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (data: VerificationData) => {
    setVerificationData(data);
    setShowLivenessCheck(false);
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY / 2));
    setIsLoading(false);
    
    // Navigate to document upload, passing current data and verification
    navigate(ROUTES.NEW_CLAIM_UPLOAD_DOCUMENTS, { 
      state: { 
        claimData: formData,
        verificationData: data
      } 
    });
  };

  const handleVerificationClose = () => {
    setShowLivenessCheck(false);
  };

  const claimTypeOptions = [
    { value: 'auto', label: 'Auto Accident' },
    { value: 'property', label: 'Property Damage (Home)' },
    { value: 'theft', label: 'Theft / Burglary' },
    { value: 'medical', label: 'Medical Expenses' },
    { value: 'travel', label: 'Travel Insurance Claim' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div>
      <PageHeader 
        title="Start a New Claim" 
        subtitle={`Step ${currentStep} of 3: Provide Incident Details`}
        showBackButton 
        backButtonPath={ROUTES.CLAIMS} 
      />

      {/* Liveness Check Modal */}
      <LivenessCheck
        isOpen={showLivenessCheck}
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        title="Identity Verification Required"
        subtitle="Verify your identity to prevent fraud and ensure claim authenticity"
      />
      
      <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
           <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={!!user?.name}
              // Labels inside PixelCard need to be light
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            {user?.role === UserRole.POLICYHOLDER && (
                 <Input
                    label="Policy Number"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    placeholder="Enter your policy number"
                    required
                    containerClassName="[&>label]:text-text-on-dark-secondary"
                />
            )}
            <Select
              label="Type of Claim"
              name="claimType"
              value={formData.claimType}
              onChange={handleChange}
              options={claimTypeOptions}
              placeholder="Select claim type"
              required
              // Labels inside PixelCard need to be light
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            <Input
              label="Date of Loss / Incident"
              name="dateOfLoss"
              type="date"
              value={formData.dateOfLoss}
              onChange={handleChange}
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            <Textarea
              label="Brief Description of Incident"
              name="incidentDescription"
              value={formData.incidentDescription}
              onChange={handleChange}
              placeholder="Provide a summary of what happened..."
              required
              rows={5}
              // Labels inside PixelCard need to be light
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <Input
              label="Third Party Access Code (Optional)"
              name="thirdPartyAccessCode"
              value={formData.thirdPartyAccessCode}
              onChange={handleChange}
              placeholder="Enter access code if provided by witness/third party"
              containerClassName="[&>label]:text-text-on-dark-secondary"
              helperText="If you received an access code from a witness or involved party, enter it here to link their information to your claim."
            />
             {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading}>
                Next: Upload Documents
              </Button>
            </div>
          </form>
      </PixelCard>
    </div>
  );
};