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
import { WandIcon, AlertTriangleIcon, ShieldCheckIcon } from '../common/Icon';

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
  sessionId?: string;
  verificationId?: string;
}

interface FraudAlert {
  type: 'early_policy' | 'suspicious_amount' | 'location_mismatch' | 'description_flags' | 'date_inconsistency';
  severity: 'low' | 'medium' | 'high';
  message: string;
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
    estimatedAmount: '',
    location: '',
    thirdPartyAccessCode: '',
  });
  const [currentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLivenessCheck, setShowLivenessCheck] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);

  // Autofill demo data
  const autofillDemoData = () => {
    const demoScenarios = [
      {
        claimType: 'auto',
        location: 'Corner of Main Street and Oak Avenue, Cape Town',
        incidentDescription: 'Vehicle was rear-ended while stopped at traffic light. Significant damage to rear bumper and trunk area. Other driver admitted fault at scene.',
        estimatedAmount: '45000',
        dateOfLoss: '2024-01-15'
      },
      {
        claimType: 'property',
        location: '123 Vineyard Estate, Stellenbosch',
        incidentDescription: 'Burst water pipe in kitchen caused extensive flooding damage to hardwood floors, kitchen cabinets, and electrical systems. Discovered upon returning from vacation.',
        estimatedAmount: '85000',
        dateOfLoss: '2024-01-10'
      },
      {
        claimType: 'theft',
        location: 'Waterfront Shopping Centre, V&A Waterfront, Cape Town',
        incidentDescription: 'Vehicle broken into while parked at shopping center. Window smashed, laptop, camera equipment, and personal items stolen from vehicle.',
        estimatedAmount: '25000',
        dateOfLoss: '2024-01-20'
      }
    ];

    const scenario = demoScenarios[Math.floor(Math.random() * demoScenarios.length)];
    
    setFormData(prev => ({
      ...prev,
      policyNumber: `POL-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
      ...scenario
    }));
  };

  // Enhanced fraud detection
  const detectFraudIndicators = (data: ClaimFormData): FraudAlert[] => {
    const alerts: FraudAlert[] = [];
    const claimDate = new Date(data.dateOfLoss);
    const today = new Date();
    const daysSinceIncident = Math.floor((today.getTime() - claimDate.getTime()) / (1000 * 3600 * 24));

    // Check for early-duration policy claims (simulated)
    const policyStartDate = new Date('2024-01-01'); // Mock policy start
    const daysSincePolicy = Math.floor((claimDate.getTime() - policyStartDate.getTime()) / (1000 * 3600 * 24));
    
    if (daysSincePolicy < 30) {
      alerts.push({
        type: 'early_policy',
        severity: 'high',
        message: `Claim occurred only ${daysSincePolicy} days after policy inception. Early-duration claims require enhanced scrutiny.`
      });
    }

    // Check for suspicious amounts
    const amount = parseFloat(data.estimatedAmount || '0');
    if (amount > 100000) {
      alerts.push({
        type: 'suspicious_amount',
        severity: 'medium',
        message: 'High-value claim requiring additional verification and documentation.'
      });
    }

    // Check for description flags
    const suspiciousWords = ['total loss', 'complete destruction', 'everything stolen', 'fire damage', 'flood damage'];
    const description = data.incidentDescription.toLowerCase();
    const hasSuspiciousWords = suspiciousWords.some(word => description.includes(word));
    
    if (hasSuspiciousWords) {
      alerts.push({
        type: 'description_flags',
        severity: 'medium',
        message: 'Claim description contains terms requiring additional documentation and verification.'
      });
    }

    // Check for date inconsistencies
    if (daysSinceIncident > 30) {
      alerts.push({
        type: 'date_inconsistency',
        severity: 'low',
        message: `Claim reported ${daysSinceIncident} days after incident. Late reporting may indicate complications.`
      });
    }

    return alerts;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Real-time fraud detection
    if (name === 'estimatedAmount' || name === 'incidentDescription' || name === 'dateOfLoss' || name === 'claimType') {
      const alerts = detectFraudIndicators(newFormData);
      setFraudAlerts(alerts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start liveness check first
    setShowLivenessCheck(true);
  };

  const handleVerificationSuccess = async (data: VerificationData) => {
    setVerificationData(data);
    setShowLivenessCheck(false);
    setIsLoading(true);

    try {
      // Enhanced fraud analysis
      const fraudAlerts = detectFraudIndicators(formData);
      let riskScore = 25; // Base risk score

      // Calculate risk score based on alerts
      fraudAlerts.forEach(alert => {
        switch (alert.severity) {
          case 'high': riskScore += 30; break;
          case 'medium': riskScore += 20; break;
          case 'low': riskScore += 10; break;
        }
      });

      // Cap at 100
      riskScore = Math.min(riskScore, 100);

      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

      // Navigate to document upload with enhanced data
      navigate(ROUTES.NEW_CLAIM_UPLOAD_DOCUMENTS, { 
        state: { 
          claimData: formData,
          verificationData: data,
          fraudAlerts,
          riskScore
        } 
      });
    } catch (error) {
      console.error('Error processing claim:', error);
      setError('An error occurred processing your claim. Please try again.');
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-blue-500 bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Start a New Claim" 
        subtitle={`Step ${currentStep} of 4: Provide Incident Details`}
        showBackButton 
        backButtonPath={ROUTES.CLAIMS} 
      />

      {/* Fraud Detection Alerts */}
      {fraudAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {fraudAlerts.map((alert, index) => (
            <PixelCard key={index} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-3">
                <AlertTriangleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'text-red-400' :
                  alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-900/30 text-red-300' :
                      alert.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-blue-900/30 text-blue-300'
                    }`}>
                      {alert.severity.toUpperCase()} RISK
                    </span>
                    <ShieldCheckIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-text-on-dark-primary mt-1">{alert.message}</p>
                  <p className="text-xs text-text-on-dark-secondary mt-1">
                    This will be flagged for enhanced review by our fraud detection team.
                  </p>
                </div>
              </div>
            </PixelCard>
          ))}
        </div>
      )}

      {/* Liveness Check Modal */}
      <LivenessCheck
        isOpen={showLivenessCheck}
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        title="Identity Verification Required"
        subtitle="Verify your identity to prevent fraud and ensure claim authenticity"
      />
      
      <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text-on-dark-primary">Claim Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={autofillDemoData}
            leftIcon={<WandIcon className="h-4 w-4" />}
            className="border-purple-400 text-purple-300 hover:bg-purple-900/20"
          >
            Demo Autofill
          </Button>
        </div>

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