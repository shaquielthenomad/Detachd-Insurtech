import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { CheckCircleIcon, XCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Input } from '../common/Input';
import { VerificationInput } from '../../types';

const loadingMessages = [
  "Initiating secure connection...",
  "Validating credentials...",
  "Accessing SecureLedger for verification...",
  "Confirming identity on blockchain...",
  "Finalizing verification...",
];

export const VerificationStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialStatus = location.state?.inProgress ? 'loading' : (location.state?.success ? 'success' : (location.state?.failure ? 'failure' : 'loading'));
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>(initialStatus);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);
  const [userName, setUserName] = useState(location.state?.userName || 'User'); 
  const [userRole, setUserRole] = useState(location.state?.userRole || 'User'); 

  const [retryFormData, setRetryFormData] = useState<VerificationInput>({
    responderId: '',
    name: '',
    email: '',
    phone: '',
  });
  const [retryError, setRetryError] = useState('');

  useEffect(() => {
    let messageTimer: number; 
    let processTimer: number; 

    if (status === 'loading' && location.state?.inProgress) {
      setCurrentLoadingMessageIndex(0);
      setVerificationMessage(loadingMessages[0]);

      messageTimer = window.setInterval(() => { 
        setCurrentLoadingMessageIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < loadingMessages.length) {
            setVerificationMessage(loadingMessages[nextIndex]);
            return nextIndex;
          }
          return prevIndex; 
        });
      }, MOCK_DELAY * 0.8); 

      processTimer = window.setTimeout(() => { 
        clearInterval(messageTimer);
        const isSuccess = Math.random() > 0.3; 
        if (isSuccess) {
          setStatus('success');
          const currentName = location.state?.userNameForSuccess || userName;
          setUserName(currentName); 
          setUserRole(location.state?.userRole || 'User');
          setVerificationMessage( userRole ? `Welcome, ${userRole}, ${currentName}.` : `Welcome, ${currentName}.`);
        } else {
          setStatus('failure');
          setVerificationMessage("We were unable to verify your identity. Please ensure the information you provided matches your records, or try contacting support.");
        }
      }, MOCK_DELAY * loadingMessages.length * 0.7 ); 
      
      return () => {
        clearTimeout(processTimer);
        clearInterval(messageTimer);
      };
    } else if (status === 'success') {
        const currentName = location.state?.userNameForSuccess || userName;
        setVerificationMessage( userRole ? `Welcome, ${userRole}, ${currentName}.` : `Welcome, ${currentName}.`);
    } else if (status === 'failure') {
        setVerificationMessage("We were unable to verify your identity. Please ensure the information you provided matches your records, or try contacting support.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, location.state?.inProgress, location.state?.userName, location.state?.userRole, location.pathname, location.state?.userNameForSuccess]); 

  const handleRetryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRetryFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRetryError('');
    if (!retryFormData.name || !retryFormData.email) {
        setRetryError('Name and Email are required to retry verification.');
        return;
    }
    setStatus('loading');
    navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
        state: { 
            inProgress: true, 
            userNameForSuccess: retryFormData.name,
            userRole: userRole 
        }, 
        replace: true 
    });
    setRetryFormData({ responderId: '', name: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title={
            status === 'loading' ? "Verifying..." : 
            status === 'success' ? "Verification Successful" : 
            "Verification Failed"
        } 
        showBackButton={status === 'failure'}
        backButtonPath={ROUTES.ONBOARDING_VERIFICATION}
      />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="py-8 px-4 text-center">
            {status === 'loading' && (
              <>
                <LoadingSpinner size="lg" message="" /> {/* Message removed from spinner itself */}
                <p className="mt-4 text-md font-medium text-text-on-dark-secondary">{verificationMessage}</p>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mt-6">
                  <div 
                    className="bg-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${(currentLoadingMessageIndex + 1) / loadingMessages.length * 100}%` }}
                  ></div>
                </div>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-on-dark-primary mb-2">
                  {location.state?.isThirdParty ? 'Access Code Generated' : 'You have been successfully authorized.'}
                </h3>
                <p className="text-sm text-text-on-dark-secondary mb-6">{verificationMessage}</p>
                
                {location.state?.thirdPartyCode && (
                  <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg mb-4">
                    <p className="text-green-300 font-mono text-lg text-center">
                      {location.state.thirdPartyCode}
                    </p>
                    <p className="text-xs text-green-400 text-center mt-1">Save this code for claim access</p>
                  </div>
                )}
                
                {location.state?.skipDashboard ? (
                  <div className="space-y-3">
                    <Button onClick={() => navigate(ROUTES.WELCOME)} className="w-full">
                      Return to Home
                    </Button>
                    <p className="text-xs text-slate-400 text-center">
                      Limited demo access until added to a claim
                    </p>
                  </div>
                ) : (
                  <Button onClick={() => navigate(location.state?.targetRoute || ROUTES.DASHBOARD)} className="w-full">
                    Continue to {location.state?.department ? `${location.state.department} Dashboard` : 'Dashboard'}
                  </Button>
                )}
              </>
            )}
            {status === 'failure' && (
              <>
                <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-on-dark-primary mb-2">Oops! Verification Unsuccessful.</h3>
                <p className="text-sm text-text-on-dark-secondary mb-6">{verificationMessage}</p>
                
                <form onSubmit={handleRetrySubmit} className="space-y-4 text-left mt-6 border-t border-slate-700 pt-6">
                    <h4 className="text-md font-medium text-text-on-dark-primary mb-1">Retry with new information:</h4>
                    <Input
                        label="Responder ID (Optional)"
                        name="responderId"
                        value={retryFormData.responderId || ''}
                        onChange={handleRetryChange}
                        placeholder="e.g., Badge Number"
                        containerClassName="[&>label]:text-text-on-dark-secondary"
                    />
                    <Input
                        label="Full Name"
                        name="name"
                        value={retryFormData.name || ''}
                        onChange={handleRetryChange}
                        required
                        placeholder="Enter your full name"
                        containerClassName="[&>label]:text-text-on-dark-secondary"
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={retryFormData.email || ''}
                        onChange={handleRetryChange}
                        required
                        placeholder="Enter your email address"
                        containerClassName="[&>label]:text-text-on-dark-secondary"
                    />
                    <Input
                        label="Phone Number (Optional)"
                        name="phone"
                        type="tel"
                        value={retryFormData.phone || ''}
                        onChange={handleRetryChange}
                        placeholder="Enter your phone number"
                        containerClassName="[&>label]:text-text-on-dark-secondary"
                    />
                    {retryError && <p className="text-xs text-red-400 text-center">{retryError}</p>}
                    <Button type="submit" className="w-full">
                        Retry Verification
                    </Button>
                </form>

                <div className="mt-6 text-sm">
                  <p className="text-text-on-dark-secondary">
                    If issues persist, please{' '}
                    <Link to={ROUTES.HELP_CONTACT_SUPPORT} className="font-medium text-blue-300 hover:text-blue-200">
                      contact support
                    </Link>.
                  </p>
                </div>
              </>
            )}
          </div>
        </PixelCard>
      </div>
    </div>
  );
};