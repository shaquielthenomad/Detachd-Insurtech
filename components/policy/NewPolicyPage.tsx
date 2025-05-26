import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ShieldCheckIcon, CheckCircleIcon, FileTextIcon } from '../common/Icon';
import { ROUTES } from '../../constants';

interface KYCDetails {
  idNumber: string;
  idIssuanceDate: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface PolicyApplication {
  policyCode: string;
  kyc: KYCDetails;
  selectedInsurer: string;
  insuranceType: string;
}

const insurers = [
  'Santam Insurance',
  'Old Mutual Insure',
  'Hollard Insurance',
  'Auto & General',
  'Discovery Insure',
  'Momentum Insurance',
  'Outsurance',
  'Budget Insurance',
];

const insuranceTypes = [
  'Motor Vehicle Insurance',
  'Home & Property Insurance',
  'Personal Property Insurance',
  'Life Insurance',
  'Travel Insurance',
  'Business Insurance',
];

export const NewPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<PolicyApplication>({
    policyCode: '',
    kyc: {
      idNumber: '',
      idIssuanceDate: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'South African',
      address: '',
      phoneNumber: '',
      email: '',
    },
    selectedInsurer: '',
    insuranceType: '',
  });

  const handleKYCChange = (field: keyof KYCDetails, value: string) => {
    setApplication(prev => ({
      ...prev,
      kyc: { ...prev.kyc, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    // Navigate to success page or dashboard
    navigate(ROUTES.MY_POLICY);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return application.policyCode.trim().length > 0;
      case 2:
        const { kyc } = application;
        return kyc.idNumber && kyc.idIssuanceDate && kyc.firstName && kyc.lastName && 
               kyc.dateOfBirth && kyc.address && kyc.phoneNumber && kyc.email;
      case 3:
        return application.selectedInsurer && application.insuranceType;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PixelCard title="Policy Code" variant="blue" icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-4">
              <p className="text-sm text-text-on-dark-secondary">
                Enter the policy code provided by your insurer to start your application.
              </p>
              <Input
                label="Policy Code"
                value={application.policyCode}
                onChange={(e) => setApplication(prev => ({ ...prev, policyCode: e.target.value }))}
                placeholder="e.g., POL-2024-001234"
                required
              />
              <p className="text-xs text-slate-400">
                The policy code should be in the format provided by your insurance provider.
              </p>
            </div>
          </PixelCard>
        );

      case 2:
        return (
          <PixelCard title="KYC Verification" variant="blue" icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-4">
              <p className="text-sm text-text-on-dark-secondary mb-6">
                Please provide your identification details for verification purposes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="South African ID Number"
                  value={application.kyc.idNumber}
                  onChange={(e) => handleKYCChange('idNumber', e.target.value)}
                  placeholder="0000000000000"
                  required
                />
                <Input
                  label="ID Issuance Date"
                  type="date"
                  value={application.kyc.idIssuanceDate}
                  onChange={(e) => handleKYCChange('idIssuanceDate', e.target.value)}
                  required
                />
                <Input
                  label="First Name"
                  value={application.kyc.firstName}
                  onChange={(e) => handleKYCChange('firstName', e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={application.kyc.lastName}
                  onChange={(e) => handleKYCChange('lastName', e.target.value)}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={application.kyc.dateOfBirth}
                  onChange={(e) => handleKYCChange('dateOfBirth', e.target.value)}
                  required
                />
                <Input
                  label="Nationality"
                  value={application.kyc.nationality}
                  onChange={(e) => handleKYCChange('nationality', e.target.value)}
                  required
                />
              </div>
              <Input
                label="Residential Address"
                value={application.kyc.address}
                onChange={(e) => handleKYCChange('address', e.target.value)}
                placeholder="Full residential address in South Africa"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={application.kyc.phoneNumber}
                  onChange={(e) => handleKYCChange('phoneNumber', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={application.kyc.email}
                  onChange={(e) => handleKYCChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
          </PixelCard>
        );

      case 3:
        return (
          <PixelCard title="Insurance Selection" variant="blue" icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-on-dark-secondary mb-3">
                  Select Your Insurer
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insurers.map((insurer) => (
                    <label
                      key={insurer}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        application.selectedInsurer === insurer
                          ? 'border-blue-400 bg-blue-900/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="insurer"
                        value={insurer}
                        checked={application.selectedInsurer === insurer}
                        onChange={(e) => setApplication(prev => ({ ...prev, selectedInsurer: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-sm text-text-on-dark-primary">{insurer}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-on-dark-secondary mb-3">
                  Type of Insurance
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insuranceTypes.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        application.insuranceType === type
                          ? 'border-blue-400 bg-blue-900/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="insuranceType"
                        value={type}
                        checked={application.insuranceType === type}
                        onChange={(e) => setApplication(prev => ({ ...prev, insuranceType: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-sm text-text-on-dark-primary">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </PixelCard>
        );

      case 4:
        return (
          <PixelCard title="Confirm Application" variant="blue" icon={<CheckCircleIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-text-on-dark-primary mb-4">Application Summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-on-dark-secondary">Policy Code:</dt>
                    <dd className="text-text-on-dark-primary font-medium">{application.policyCode}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-on-dark-secondary">Applicant:</dt>
                    <dd className="text-text-on-dark-primary font-medium">
                      {application.kyc.firstName} {application.kyc.lastName}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-on-dark-secondary">ID Number:</dt>
                    <dd className="text-text-on-dark-primary font-medium">{application.kyc.idNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-on-dark-secondary">Insurer:</dt>
                    <dd className="text-text-on-dark-primary font-medium">{application.selectedInsurer}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-on-dark-secondary">Insurance Type:</dt>
                    <dd className="text-text-on-dark-primary font-medium">{application.insuranceType}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                <p className="text-sm text-yellow-200">
                  <strong>Important:</strong> Your application will be sent to {application.selectedInsurer} for review and approval. 
                  You will receive an email confirmation once your policy is activated.
                </p>
              </div>
            </div>
          </PixelCard>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader 
        title="New Policy Application" 
        subtitle="Apply for a new insurance policy" 
        showBackButton 
        backButtonPath={ROUTES.MY_POLICY}
      />

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 4 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Policy Code</span>
          <span>KYC Details</span>
          <span>Selection</span>
          <span>Confirm</span>
        </div>
      </div>

      {renderStep()}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!isStepValid()}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!isStepValid()}
          >
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}; 