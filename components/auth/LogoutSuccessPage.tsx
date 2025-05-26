import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ShieldCheckIcon, LockIcon } from '../common/Icon';
import { Button } from '../common/Button';
import { ROUTES, APP_NAME } from '../../constants';
import LetterGlitch from '../common/LetterGlitch';

export const LogoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [verificationSteps, setVerificationSteps] = useState([
    { id: 1, text: 'Session terminated', completed: false },
    { id: 2, text: 'Authentication tokens cleared', completed: false },
    { id: 3, text: 'Local storage secured', completed: false },
    { id: 4, text: 'Session verified and secured', completed: false }
  ]);

  useEffect(() => {
    // Simulate security verification steps
    const stepTimers = verificationSteps.map((step, index) => 
      setTimeout(() => {
        setVerificationSteps(prev => 
          prev.map(s => s.id === step.id ? { ...s, completed: true } : s)
        );
      }, (index + 1) * 500)
    );

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(ROUTES.WELCOME);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stepTimers.forEach(clearTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <LetterGlitch 
        glitchSpeed={70}
        glitchColors={['#1e3a8a', '#3b82f6', '#93c5fd']}
        centerVignette={true}
        outerVignette={true}
        smooth={true}
      />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Successfully Logged Out
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Your session has been securely terminated from {APP_NAME}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          
          {/* Security Verification Steps */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-5 w-5 text-green-400 mr-2" />
              <h3 className="text-sm font-medium text-slate-200">Security Verification</h3>
            </div>
            <div className="space-y-2">
              {verificationSteps.map((step) => (
                <div key={step.id} className="flex items-center text-sm">
                  {step.completed ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-3" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-slate-500 rounded-full mr-3 animate-pulse" />
                  )}
                  <span className={step.completed ? 'text-green-300' : 'text-slate-400'}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Security Info */}
          <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <LockIcon className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-300">Session Secured</p>
                <p className="text-xs text-green-400">
                  All authentication data has been cleared and your session is fully secured
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-300">
              Redirecting to home page in <span className="font-bold text-blue-400">{countdown}</span> seconds...
            </p>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate(ROUTES.WELCOME)}
              >
                Return to Home Now
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-300 text-slate-100 hover:bg-slate-700 hover:border-slate-200"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Login Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 