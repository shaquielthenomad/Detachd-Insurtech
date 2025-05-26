import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { CheckCircleIcon } from '../common/Icon';
import { ROUTES } from '../../constants';

export const ClaimSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract different state properties for different success scenarios
  const claimNumber = location.state?.claimNumber || 'your new claim';
  const isWitness = location.state?.isWitness || false;
  const message = location.state?.message || 'We\'ve received your claim and it\'s now being processed. You\'ll receive updates via email and in-app notifications.';
  const redirectTo = location.state?.redirectTo || ROUTES.DASHBOARD;
  const redirectText = location.state?.redirectText || 'Go to Dashboard';

  const getTitle = () => {
    if (isWitness) return "Witness Statement Submitted!";
    return "Your claim has been submitted!";
  };

  return (
    <div>
      <PageHeader title="Success!" />
      
      <PixelCard variant="blue">
        <div className="text-center py-12">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400" />
          <h2 className="mt-4 text-2xl font-semibold text-text-on-dark-primary">
            {getTitle()}
          </h2>
          <p className="mt-2 text-text-on-dark-secondary">
            {claimNumber !== 'your new claim' && (
              <>
                Claim Number: <span className="font-medium text-text-on-dark-primary">{claimNumber}</span>
                <br />
              </>
            )}
          </p>
          <p className="mt-2 text-text-on-dark-secondary">
            {message}
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            {!isWitness && (
              <Button 
                onClick={() => navigate(ROUTES.CLAIMS)} 
                className="w-full sm:w-auto"
              >
                View My Claims
              </Button>
            )}
            <Button 
              variant={isWitness ? "primary" : "outline"}
              className={isWitness ? "" : "border-slate-400 text-slate-300 hover:bg-slate-700/30"}
              onClick={() => navigate(redirectTo)}
            >
              {redirectText}
            </Button>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};