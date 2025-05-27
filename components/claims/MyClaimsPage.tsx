import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Claim, ClaimStatus } from '../../types';
import { ROUTES } from '../../constants';
import { PlusCircleIcon, ChevronRightIcon, FileTextIcon, DownloadIcon, CheckCircleIcon } from '../common/Icon'; 
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const getStatusBadgeStyles = (status: ClaimStatus): string => {
  // Styles for dark PixelCard background
  switch (status) {
    case ClaimStatus.APPROVED: return 'text-green-300 bg-green-700/30 border-green-500';
    case ClaimStatus.REJECTED: return 'text-red-300 bg-red-700/30 border-red-500';
    case ClaimStatus.IN_REVIEW: return 'text-yellow-300 bg-yellow-700/30 border-yellow-500';
    case ClaimStatus.SUBMITTED: return 'text-blue-300 bg-blue-700/30 border-blue-500';
    case ClaimStatus.CLOSED: return 'text-slate-300 bg-slate-700/30 border-slate-500';
    default: return 'text-slate-400 bg-slate-700/30 border-slate-600';
  }
};

export const MyClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
       // Mock data for demonstration, replace with actual API call
      const mockUserClaims: Claim[] = [
        { id: 'clm001', claimNumber: 'DET-001', policyholderName: user?.name || 'John Smith', dateOfLoss: '2024-07-15', claimType: 'Auto Accident', status: ClaimStatus.IN_REVIEW, amountClaimed: 25000 },
        { id: 'clm002', claimNumber: 'DET-002', policyholderName: user?.name || 'John Smith', dateOfLoss: '2024-06-20', claimType: 'Property Damage', status: ClaimStatus.APPROVED, amountClaimed: 12000 },
        { id: 'clm003', claimNumber: 'DET-003', policyholderName: user?.name || 'John Smith', dateOfLoss: '2024-05-01', claimType: 'Theft', status: ClaimStatus.REJECTED, amountClaimed: 8000 },
      ];
      setClaims(mockUserClaims);
      setIsLoading(false);
    };
    fetchClaims();
  }, [user?.name]);

  if (isLoading) {
    return <LoadingSpinner message="Loading your claims..." />;
  }

  return (
    <div>
      <PageHeader 
        title="My Claims" 
        subtitle={`${claims.length} total claims • ${claims.filter(c => c.status === ClaimStatus.APPROVED).length} approved`}
        actions={
          <Link to={ROUTES.NEW_CLAIM}>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
              Start a New Claim
            </Button>
          </Link>
        }
      />

      {claims.length === 0 ? (
        <PixelCard variant="blue">
          <div className="text-center py-12">
            <FileTextIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
            <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No claims yet</h3>
            <p className="mt-1 text-sm text-text-on-dark-secondary">You haven't submitted any claims yet. Start a new claim to get started.</p>
            <div className="mt-6">
              <Link to={ROUTES.NEW_CLAIM}>
                <Button variant="primary" leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
                  Start a Claim
                </Button>
              </Link>
            </div>
          </div>
        </PixelCard>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <PixelCard key={claim.id} variant="blue" className="hover:border-blue-400 transition-colors">
              <div className="p-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="block">
                      <h3 className="text-lg font-semibold text-blue-300 hover:underline">
                        Claim #{claim.claimNumber}
                      </h3>
                      <p className="text-sm text-text-on-dark-secondary">{claim.claimType}</p>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    {claim.status === ClaimStatus.APPROVED && (
                      <>
                        <Link 
                          to="/test-certificate"
                          className="flex items-center px-3 py-2 bg-green-700/30 text-green-300 rounded-md hover:bg-green-700/50 transition-colors border border-green-500/50"
                          title="Download Certificate"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Certificate</span>
                        </Link>
                      </>
                    )}
                    <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="text-text-on-dark-secondary hover:text-blue-300">
                      <ChevronRightIcon className="h-6 w-6" />
                    </Link>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-text-on-dark-secondary">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Date:</span>
                      {new Date(claim.dateOfLoss).toLocaleDateString()}
                    </div>
                    {claim.amountClaimed && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Amount:</span>
                        R {claim.amountClaimed.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              </div>
            </PixelCard>
          ))}
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {claims.filter(c => c.status === ClaimStatus.APPROVED).length}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Approved Claims</div>
              </div>
            </PixelCard>
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Under Review</div>
              </div>
            </PixelCard>
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  R {claims.filter(c => c.status === ClaimStatus.APPROVED).reduce((sum, claim) => sum + (claim.amountClaimed || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Total Approved</div>
              </div>
            </PixelCard>
          </div>
        </div>
      )}
    </div>
  );
};