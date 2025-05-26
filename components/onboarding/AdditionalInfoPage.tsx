import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole, VerificationInput } from '../../types';

export const AdditionalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole | undefined;

  const [formData, setFormData] = useState<VerificationInput>({
    responderRole: '',
    department: '',
    contactNumber: '',
    emailAddress: '',
    teamAssignment: '',
    reportingPreferences: '',
    governmentId: '',
    governmentDepartment: '',
    officialTitle: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === UserRole.RESPONDER && (!formData.responderRole || !formData.department || !formData.contactNumber || !formData.emailAddress)) {
      setError('Please fill in all required fields for responder.');
      return;
    }
    if (role === UserRole.INSURER_PARTY && (!formData.teamAssignment || !formData.reportingPreferences)) {
        setError('Please fill in all required fields for insurer party.');
        return;
    }
    if (role === UserRole.GOVERNMENT_OFFICIAL && (!formData.name || !formData.governmentId || !formData.governmentDepartment || !formData.officialTitle || !formData.emailAddress)) {
        setError('Please fill in all required fields for government verification.');
        return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    setIsLoading(false);

    if (role === UserRole.RESPONDER) {
        navigate(ROUTES.ONBOARDING_UPLOAD_ID, { state: { role, formData } });
    } else {
        navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { state: { success: true, userName: "User", userRole: role } });
    }
  };

  const teamOptions = [
    { value: 'claims_team_a', label: 'Claims Team Alpha' },
    { value: 'claims_team_b', label: 'Claims Team Bravo' },
    { value: 'underwriting', label: 'Underwriting Department' },
    { value: 'fraud_investigation', label: 'Fraud Investigation Unit' },
  ];

  const preferenceOptions = [
    { value: 'daily_email', label: 'Daily Email Summary' },
    { value: 'weekly_report', label: 'Weekly PDF Report' },
    { value: 'realtime_dashboard', label: 'Real-time Dashboard Only' },
    { value: 'api_integration', label: 'API Integration Updates' },
  ];
  
  const departmentOptions = [
    { value: 'police', label: 'Police Department' },
    { value: 'fire', label: 'Fire Department' },
    { value: 'ems', label: 'Emergency Medical Services' },
    { value: 'other', label: 'Other Official Agency' },
  ];

  let pageTitle = "Provide Additional Information";
  let pageSubtitle = "Please complete the form below.";
  if (role === UserRole.RESPONDER) pageSubtitle = "Please provide your responder details.";
  if (role === UserRole.GOVERNMENT_OFFICIAL) {
    pageTitle = "Government Official Verification";
    pageSubtitle = "Please provide your official government credentials for manual verification.";
  }
  if (role === UserRole.INSURER_PARTY) pageSubtitle = "Please provide your team and reporting preferences.";

  return (
          <div className="min-h-screen bg-slate-900 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <PageHeader title={pageTitle} subtitle={pageSubtitle} showBackButton />
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <form onSubmit={handleSubmit} className="space-y-6">
            {role === UserRole.RESPONDER && (
              <>
                <Input label="Responder Role" name="responderRole" value={formData.responderRole || ''} onChange={handleChange} placeholder="e.g., Police Officer" required containerClassName="[&>label]:text-text-on-dark-secondary" />
                <Select label="Department" name="department" options={departmentOptions} value={formData.department || ''} onChange={handleChange} placeholder="Select your department" required containerClassName="[&>label]:text-text-on-dark-secondary" />
                <Input label="Contact Number" name="contactNumber" type="tel" value={formData.contactNumber || ''} onChange={handleChange} placeholder="Your official contact number" required containerClassName="[&>label]:text-text-on-dark-secondary" />
                <Input label="Email Address" name="emailAddress" type="email" value={formData.emailAddress || ''} onChange={handleChange} placeholder="Your official email address" required containerClassName="[&>label]:text-text-on-dark-secondary" />
              </>
            )}

            {role === UserRole.INSURER_PARTY && (
                <>
                    <Select label="Team Assignment" name="teamAssignment" options={teamOptions} value={formData.teamAssignment || ''} onChange={handleChange} placeholder="Select your team" required containerClassName="[&>label]:text-text-on-dark-secondary"/>
                    <Select label="Reporting Preferences" name="reportingPreferences" options={preferenceOptions} value={formData.reportingPreferences || ''} onChange={handleChange} placeholder="Select reporting preference" required containerClassName="[&>label]:text-text-on-dark-secondary"/>
                </>
            )}
            
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </form>
        </PixelCard>
      </div>
    </div>
  );
};