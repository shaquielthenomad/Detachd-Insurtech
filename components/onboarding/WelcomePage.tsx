import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { APP_NAME, ROUTES } from '../../constants';
import Squares from '../common/Squares';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Squares 
          speed={0.5}
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(20, 20, 20, 0.8)'
          hoverFillColor='rgba(0, 191, 255, 0.3)'
        />
      </div>
      <div className="relative z-10 w-full max-w-lg text-center"> 
        <header className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-slate-100 mb-4">{APP_NAME}</h1>
          <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
            AI Fraud Detection, Made for South Africa.
          </p>
        </header>
        
        <main className="w-full space-y-4 mb-10">
          <Button 
            size="lg" 
            variant="primary" 
            className="w-full" 
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Log In
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full border-slate-300 text-slate-100 hover:bg-slate-700 hover:border-slate-200" 
            onClick={() => navigate(ROUTES.ONBOARDING_ROLE_SELECTION)}
          >
            Sign Up
          </Button>
          <Button 
            size="lg" 
            variant="ghost" 
            className="w-full text-slate-100 hover:bg-slate-700" 
            onClick={() => navigate(ROUTES.ENTER_CLAIM_CODE)}
          >
            Enter Claim Code
          </Button>
        </main>

        <div className="mb-8 text-center">
          <Link to={ROUTES.CONTACT} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            Need Help? Contact Support
          </Link>
        </div>

        <footer className="w-full text-center space-y-3">
          <p className="text-xs text-slate-400">
            By continuing, you agree to our <Link to={ROUTES.TERMS_CONDITIONS} className="underline hover:text-sky-400">Terms of Service</Link> and <Link to={ROUTES.PRIVACY_POLICY} className="underline hover:text-sky-400">Privacy Policy</Link>.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Powered by SecureAI Blockchain Verification.
          </p>
        </footer>
      </div>
    </div>
  );
};