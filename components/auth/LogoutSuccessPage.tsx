import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '../common/Icon';
import { Button } from '../common/Button';
import { ROUTES, APP_NAME } from '../../constants';
import LetterGlitch from '../common/LetterGlitch';

export const LogoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
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

    return () => clearInterval(timer);
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
            You have been safely logged out of {APP_NAME}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
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