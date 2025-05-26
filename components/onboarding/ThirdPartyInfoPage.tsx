import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { UserIcon, MailIcon, PhoneIcon } from '../common/Icon';

// South African country codes (most common ones)
const countryCodes = [
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+49', label: '+49 (Germany)' },
];

interface ThirdPartyData {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
}

export const ThirdPartyInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole;
  
  const [formData, setFormData] = useState<ThirdPartyData>({
    name: '',
    email: '',
    countryCode: '+27',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    const code = generateCode();
    setGeneratedCode(code);
    setIsCodeGenerated(true);
    setIsLoading(false);
  };

  const handleContinue = () => {
    navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
      state: { 
        success: true, 
        userName: formData.name,
        userRole: role,
        thirdPartyCode: generatedCode,
        isThirdParty: true,
        skipDashboard: true 
      } 
    });
  };

  if (isCodeGenerated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader 
          title="Third Party Access Code Generated" 
          subtitle="Your unique code has been created"
        />
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
            <div className="text-center space-y-6">
              <div className="bg-green-900/20 border border-green-600/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-400 mb-2">Your Access Code</h3>
                <div className="text-3xl font-mono font-bold text-green-300 tracking-wider">
                  {generatedCode}
                </div>
              </div>
              
              <div className="text-left bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-on-dark-primary mb-2">Next Steps:</h4>
                <ul className="text-sm text-text-on-dark-secondary space-y-1">
                  <li>• Save this code - you'll need it to access claim information</li>
                  <li>• Share this code with the policyholder or their insurer</li>
                  <li>• You'll be notified when you're added to a claim</li>
                  <li>• Information is sent for approval - be on the lookout for updates</li>
                </ul>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>In the meantime:</strong> Explore our features using our demo account. 
                  You'll have limited access until you're officially added to a claim.
                </p>
              </div>
              
              <Button onClick={handleContinue} className="w-full">
                Continue to Demo Access
              </Button>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Third Party Information" 
        subtitle="Provide your details to be added to a claim"
        showBackButton 
        backButtonPath={ROUTES.ONBOARDING_ROLE_SELECTION}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <UserIcon className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary">
                Personal Information
              </h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary">
              We'll generate a unique code for you to be added to insurance claims.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <div>
              <label className="block text-sm font-medium text-text-on-dark-secondary mb-2">
                Phone Number
              </label>
              <div className="flex space-x-2">
                <Select
                  name="countryCode"
                  options={countryCodes}
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-32"
                />
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="81 234 5678"
                  required
                  containerClassName="flex-1"
                />
              </div>
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              Generate Access Code
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Your information will be shared only with relevant parties for claim processing purposes.
            </p>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}; 