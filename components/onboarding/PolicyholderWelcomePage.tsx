import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { Input } from '../common/Input';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const PolicyholderWelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [policyNumber, setPolicyNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !policyNumber) {
      setError('Full name and policy number are required.');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    if (!user) {
        try {
            await login( `${fullName.replace(/\s+/g, '.').toLowerCase()}@example.com`, 'demo123'); 
        } catch (err) {
            setError("Failed to process your information. Please try again.");
            setIsLoading(false);
            return;
        }
    } else {
        navigate(ROUTES.NEW_CLAIM, { state: { policyholderName: fullName, policyNumber }});
    }
    setIsLoading(false);
    // AuthContext useEffect will navigate to dashboard if login is successful
  };
  
  const welcomeMessage = user?.name ? `Welcome, ${user.name}!` : "Let's get started";
  const subMessage = user?.name ? 
    "As a policyholder, you'll need to provide some information and documents to submit your claim. We'll guide you through each step." :
    "Please enter your details to begin.";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader title="Welcome to Detachd" showBackButton />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text-on-dark-primary">{welcomeMessage}</h2>
            <p className="mt-2 text-sm text-text-on-dark-secondary">{subMessage}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={!!user?.name}
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            <Input
              label="Policy Number"
              name="policyNumber"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="Enter your policy number"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Continue
              </Button>
            </div>
          </form>
        </PixelCard>
      </div>
    </div>
  );
};