import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { FileTextIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../common/Icon';
import { ROUTES } from '../../constants';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Claim {
  id: string;
  claimNumber: string;
  dateOfLoss: string;
  claimType: string;
  status: string;
  description?: string;
  location?: string;
  policyholderName?: string;
}

export const WitnessClaimPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);

  useEffect(() => {
    fetchWitnessClaims();
  }, []);

  const fetchWitnessClaims = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock witness claims data
      const mockClaims: Claim[] = [
        {
          id: 'claim-001',
          claimNumber: 'CLM-2024-W001',
          dateOfLoss: '2024-01-15',
          claimType: 'Motor Vehicle Accident',
          status: 'Pending Statement',
          description: 'Intersection collision at Main St and Oak Ave',
          location: 'Main St & Oak Ave, Cape Town',
          policyholderName: 'John Smith'
        }
      ];
      
      setClaims(mockClaims);
    } catch (error) {
      console.error('Failed to fetch witness claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStatement = async (claimId: string) => {
    if (!statement.trim()) return;
    
    setSubmitting(true);
    setActiveClaimId(claimId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setStatement('');
      
      // Update claim status
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: 'Statement Submitted' }
          : claim
      ));
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit statement:', error);
      alert('Failed to submit statement. Please try again.');
    } finally {
      setSubmitting(false);
      setActiveClaimId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your witness assignments..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        <PageHeader 
          title="Witness Dashboard" 
          subtitle={`Welcome ${user?.name || 'Witness'}, manage your witness statements here`}
        />

        {/* Status Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <FileTextIcon className="h-8 w-8 text-blue-400 mr-4" />
              <div>
                <p className="text-2xl font-bold text-text-on-dark-primary">{claims.length}</p>
                <p className="text-sm text-text-on-dark-secondary">Assigned Claims</p>
              </div>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-400 mr-4" />
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {claims.filter(c => c.status === 'Pending Statement').length}
                </p>
                <p className="text-sm text-text-on-dark-secondary">Pending Statements</p>
              </div>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mr-4" />
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {claims.filter(c => c.status === 'Statement Submitted').length}
                </p>
                <p className="text-sm text-text-on-dark-secondary">Completed</p>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Claims List */}
        <div className="mt-8 space-y-6">
          {claims.length === 0 ? (
            <PixelCard variant="blue" className="p-8">
              <div className="text-center py-8">
                <FileTextIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-on-dark-primary mb-3">No Claims Assigned</h3>
                <p className="text-text-on-dark-secondary mb-4 max-w-md mx-auto">
                  You are not currently assigned as a witness on any claims. When you are added as a witness to a claim, it will appear here.
                </p>
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="text-blue-400 text-sm font-medium mb-2">What happens next?</h4>
                  <ul className="text-xs text-text-on-dark-secondary space-y-1">
                    <li>• You'll receive an email notification when assigned</li>
                    <li>• Review incident details and provide your statement</li>
                    <li>• Submit your witness account securely</li>
                  </ul>
                </div>
              </div>
            </PixelCard>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-text-on-dark-primary mb-4">
                Your Witness Assignments
              </h2>
              
              {claims.map(claim => (
                <PixelCard key={claim.id} variant="blue" className="p-6">
                  <div className="space-y-6">
                    {/* Claim Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-on-dark-primary">
                            Claim #{claim.claimNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            claim.status === 'Pending Statement' 
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                              : 'bg-green-900/30 text-green-400 border border-green-700'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-on-dark-secondary">
                          <div>
                            <span className="font-medium">Type:</span> {claim.claimType}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(claim.dateOfLoss).toLocaleDateString()}
                          </div>
                          {claim.location && (
                            <div>
                              <span className="font-medium">Location:</span> {claim.location}
                            </div>
                          )}
                          {claim.policyholderName && (
                            <div>
                              <span className="font-medium">Policyholder:</span> {claim.policyholderName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Incident Description */}
                    {claim.description && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-text-on-dark-primary mb-2">Incident Description</h4>
                        <p className="text-sm text-text-on-dark-secondary">{claim.description}</p>
                      </div>
                    )}

                    {/* Statement Section */}
                    {claim.status === 'Pending Statement' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-text-on-dark-primary mb-3">Your Witness Statement</h4>
                          <Textarea
                            value={statement}
                            onChange={e => setStatement(e.target.value)}
                            placeholder="Please provide a detailed account of what you witnessed. Include the time, location, weather conditions, what you saw happen, and any other relevant details..."
                            rows={6}
                            className="w-full"
                          />
                          <p className="text-xs text-text-on-dark-secondary mt-2">
                            Please be as detailed and accurate as possible. This statement may be used in legal proceedings.
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-text-on-dark-secondary">
                            Statement will be securely recorded and timestamped
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => handleSubmitStatement(claim.id)}
                            isLoading={submitting && activeClaimId === claim.id}
                            disabled={!statement.trim() || submitting}
                          >
                            {submitting && activeClaimId === claim.id ? 'Submitting...' : 'Submit Statement'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {success && claim.status === 'Statement Submitted' && (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">Statement submitted successfully!</span>
                        </div>
                        <p className="text-sm text-text-on-dark-secondary mt-1">
                          Thank you for your witness statement. The claim adjusters will review your submission.
                        </p>
                      </div>
                    )}

                    {/* Completed Statement */}
                    {claim.status === 'Statement Submitted' && !success && (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">Statement completed</span>
                        </div>
                        <p className="text-sm text-text-on-dark-secondary mt-1">
                          Your witness statement has been submitted and is under review.
                        </p>
                      </div>
                    )}
                  </div>
                </PixelCard>
              ))}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <PixelCard variant="gray" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-text-on-dark-primary">Account Settings</h4>
                <p className="text-xs text-text-on-dark-secondary">
                  Manage your profile, notification preferences, and security settings
                </p>
              </div>
              <div className="flex space-x-3">
                <Link to={ROUTES.SETTINGS}>
                  <Button variant="secondary" size="sm">Account Settings</Button>
                </Link>
                <Link to={ROUTES.HELP_CONTACT_SUPPORT}>
                  <Button variant="secondary" size="sm">Need Help?</Button>
                </Link>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Important Notice */}
        <div className="mt-6">
          <PixelCard variant="gray" className="p-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-text-on-dark-primary mb-1">Important Notice</h4>
                <p className="text-xs text-text-on-dark-secondary">
                  As a witness, you are providing testimony that may be used in legal proceedings. Please ensure your statements are truthful, accurate, and complete. 
                  False statements may result in legal consequences.
                </p>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
}; 