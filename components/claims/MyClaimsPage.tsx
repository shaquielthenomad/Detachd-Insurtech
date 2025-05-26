import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Claim, ClaimStatus } from '../../types';
import { ROUTES } from '../../constants';
import { PlusCircleIcon, ChevronRightIcon, FileTextIcon } from '../common/Icon'; 
import { LoadingSpinner } from '../common/LoadingSpinner';

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
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
       // Mock data for demonstration, replace with actual API call
      const mockUserClaims: Claim[] = [
        { id: 'clm001', claimNumber: 'DET-001', policyholderName: 'Thabo Mthembu', dateOfLoss: '2024-07-15', claimType: 'Auto Accident', status: ClaimStatus.IN_REVIEW, amountClaimed: 25000 },
        { id: 'clm002', claimNumber: 'DET-002', policyholderName: 'Thabo Mthembu', dateOfLoss: '2024-06-20', claimType: 'Property Damage', status: ClaimStatus.APPROVED, amountClaimed: 12000 },
        { id: 'clm003', claimNumber: 'DET-003', policyholderName: 'Thabo Mthembu', dateOfLoss: '2024-05-01', claimType: 'Theft', status: ClaimStatus.REJECTED, amountClaimed: 8000 },
      ];
      setClaims(mockUserClaims);
      setIsLoading(false);
    };
    fetchClaims();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your claims..." />;
  }

  return (
    <div>
      <PageHeader 
        title="My Claims" 
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
            <PixelCard key={claim.id} variant="blue" className="hover:border-blue-400 transition-colors" onClick={() => { /* Navigate to claim details */ }}>
               <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="block p-1 text-text-on-dark-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 hover:underline">
                      Claim #{claim.claimNumber}
                    </h3>
                    <p className="text-sm text-text-on-dark-secondary">{claim.claimType}</p>
                  </div>
                  <ChevronRightIcon className="h-6 w-6 text-text-on-dark-secondary" />
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-text-on-dark-secondary">
                      Date of Loss: {new Date(claim.dateOfLoss).toLocaleDateString()}
                    </p>
                    {claim.amountClaimed && (
                      <p className="mt-2 flex items-center text-sm text-text-on-dark-secondary sm:mt-0 sm:ml-6">
                        Amount: R {claim.amountClaimed.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm sm:mt-0">
                     <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                        {claim.status}
                      </span>
                  </div>
                </div>
              </Link>
            </PixelCard>
          ))}
        </div>
      )}
    </div>
  );
};