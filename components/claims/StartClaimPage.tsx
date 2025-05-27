import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { LivenessCheck } from '../common/LivenessCheck';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { useSecureAuth } from '../../contexts/SecureAuthContext';
import { sanitizeHtml, validateClaimForm, sanitizeFormData } from '../../utils/validation';
import { CameraIcon, UploadCloudIcon, FileTextIcon, UserIcon } from '../common/Icon';

interface ClaimFormData {
  fullName: string;
  policyNumber: string;
  claimType: string;
  dateOfLoss: string;
  incidentDescription: string;
  estimatedAmount: string;
  location: string;
  thirdPartyAccessCode?: string;
}

interface VerificationData {
  photoDataUrl: string;
  timestamp: string;
}

export const StartClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSecureAuth();

  // Pre-fill from location state if available
  const initialPolicyId = location.state?.policyId || '';
  const initialPolicyNumber = location.state?.policyNumber || '';

  const [formData, setFormData] = useState<ClaimFormData>({
    fullName: user?.name || '',
    policyNumber: initialPolicyNumber,
    claimType: '',
    dateOfLoss: '',
    incidentDescription: '',
    estimatedAmount: '',
    location: '',
    thirdPartyAccessCode: '',
  });
  const [currentStep, setCurrentStep] = useState(1); // Step management will be simple for now
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLivenessCheck, setShowLivenessCheck] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [policyNumberInput, setPolicyNumberInput] = useState(initialPolicyNumber);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Sanitize input immediately to prevent XSS
    const sanitizedValue = sanitizeHtml(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(''); // Error will be set by validation or later steps

    // Validate form data before proceeding to liveness check
    const validation = validateClaimForm(formData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      setIsLoading(false); // Ensure loading is stopped if validation fails early
      return;
    }

    // If validation passes, show the liveness check modal
    // The actual submission logic will be moved to handleVerificationSuccess
    setShowLivenessCheck(true); 
  };

  const handleVerificationSuccess = async (data: VerificationData) => {
    setVerificationData(data);
    setShowLivenessCheck(false);
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      // FormData is already validated by handleSubmit before showing liveness check
      const sanitizedData = sanitizeFormData(formData); // formData comes from component state

      // Step 1: (Was Step 2 in old handleSubmit) Run AI fraud detection analysis
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';
      const token = localStorage.getItem('detachd_token');
      
      const aiResponse = await fetch(`${API_BASE_URL}/ai/analyze-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: sanitizedData.incidentDescription,
          claimType: sanitizedData.claimType,
          estimatedAmount: parseFloat(sanitizedData.estimatedAmount || '0'),
          location: sanitizedData.location,
          incidentDate: sanitizedData.dateOfLoss
        })
      });

      let riskScore = 25; // Default low risk
      let aiAnalysis = 'Standard claim processing';
      
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        riskScore = aiResult.riskScore || 25;
        aiAnalysis = aiResult.analysis || 'AI analysis completed';
      } else {
        console.warn('AI analysis request failed or returned non-OK status.');
        // Decide if this is a critical failure or if we can proceed with default risk
      }

      // Step 2: (Was Step 3 in old handleSubmit) Submit claim data with AI analysis
      const claimPayload = {
        incidentDate: sanitizedData.dateOfLoss,
        location: sanitizedData.location,
        description: sanitizedData.incidentDescription,
        policyNumber: policyNumberInput, // Use policyNumberInput state
        claimType: sanitizedData.claimType,
        estimatedAmount: parseFloat(sanitizedData.estimatedAmount || '0'),
        witnesses: [], // Placeholder
        policeReportNumber: '', // Placeholder
        riskScore,
        aiAnalysis,
        status: riskScore > 70 ? 'under_review' : 'pending',
        // Include liveness verification data if your backend expects it
        // verificationPhoto: data.photoDataUrl, 
        // verificationTimestamp: data.timestamp,
      };
      
      const claimResponse = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(claimPayload)
      });

      let claimIdForNavigation: string | null = null;

      if (claimResponse.ok) {
        const result = await claimResponse.json();
        claimIdForNavigation = result.claimId; // Assuming the API returns claimId
        
        // Show AI analysis results as a non-blocking info/warning
        if (riskScore > 70) {
          // Consider using a more user-friendly notification system than alert
          alert(`⚠️ Claim ${claimIdForNavigation} flagged for review (Risk Score: ${riskScore}%). Additional verification may be required.`);
        } else if (riskScore > 40) {
          alert(`ℹ️ Claim ${claimIdForNavigation} submitted for standard processing (Risk Score: ${riskScore}%). Your claim will be reviewed shortly.`);
        }
         // Navigate to document upload on successful API submission
        navigate(ROUTES.NEW_CLAIM_UPLOAD_DOCUMENTS, { 
          state: { 
            claimData: formData, // Pass the original form data
            verificationData: data, // Pass the liveness verification data
            claimId: claimIdForNavigation, // Pass the newly created claim ID
            riskScore: riskScore // Pass risk score if needed on next page
          } 
        });

      } else {
        // API submission failed, use fallback / demo logic
        console.error('Claim submission API call failed:', claimResponse.statusText);
        const mockClaimId = `clm${Math.floor(100000 + Math.random() * 900000)}`;
        claimIdForNavigation = mockClaimId;

        const newClaim = {
          id: mockClaimId,
          claimNumber: mockClaimId,
          policyholderName: user?.name || 'Mock User',
          policyId: initialPolicyId, // from component state
          policyNumber: policyNumberInput, // from component state
          dateOfLoss: sanitizedData.dateOfLoss,
          claimType: sanitizedData.claimType,
          status: riskScore > 70 ? 'IN_REVIEW' : riskScore > 40 ? 'SUBMITTED' : 'SUBMITTED',
          amountClaimed: parseFloat(sanitizedData.estimatedAmount || '0'),
          // Add verification data to mock if needed
        };

        try {
          const existingClaims = JSON.parse(localStorage.getItem('userClaims') || '[]');
          existingClaims.push(newClaim);
          localStorage.setItem('userClaims', JSON.stringify(existingClaims));
        } catch (storageError) {
          console.error('Error saving mock claim to localStorage:', storageError);
        }
        
        if (riskScore > 70) {
          alert(`⚠️ Mock Claim ${mockClaimId} flagged for review (Risk Score: ${riskScore}%). Additional verification may be required.`);
        } else if (riskScore > 40) {
          alert(`ℹ️ Mock Claim ${mockClaimId} submitted for standard processing (Risk Score: ${riskScore}%).`);
        } else {
          alert(`✅ Mock Claim ${mockClaimId} submitted successfully! (Risk Score: ${riskScore}% - Low Risk)`);
        }
        
        // Navigate to document upload for demo flow
        navigate(ROUTES.NEW_CLAIM_UPLOAD_DOCUMENTS, { 
          state: { 
            claimData: formData,
            verificationData: data,
            claimId: mockClaimId, // Pass mock claim ID
            riskScore: riskScore
          } 
        });
      }
    } catch (error) {
      console.error('Error during verification success handling or claim submission:', error);
      setError('An unexpected error occurred while processing your claim after verification. Please try again.');
      // Potentially navigate to an error page or show error inline
    } finally {
      setIsLoading(false);
    }
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
                    value={policyNumberInput}
                    onChange={(e) => setPolicyNumberInput(e.target.value)}
                    placeholder="Enter your policy number"
                    readOnly={!!initialPolicyNumber}
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
            <Input
              label="Location of Incident"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., 123 Main Street, Cape Town"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            <Input
              label="Estimated Claim Amount (R)"
              name="estimatedAmount"
              type="number"
              value={formData.estimatedAmount}
              onChange={handleChange}
              placeholder="e.g., 15000"
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
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              isLoading={isLoading}
            >
              Proceed to Identity Verification
            </Button>
          </form>
      </PixelCard>
    </div>
  );
};