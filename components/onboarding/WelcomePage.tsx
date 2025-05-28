import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { APP_NAME, ROUTES } from '../../constants';
import { ShieldCheckIcon, ZapIcon, SearchIcon, CheckCircleIcon } from '../common/Icon'; 
import Squares from '../common/Squares';
import GlassIcons from '../common/GlassIcons'; // Import GlassIcons

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const glassIconItems = [
    {
      icon: <ShieldCheckIcon className="w-full h-full text-sky-100" />, // Adjusted icon styling for GlassIcons
      color: 'blue', // Corresponds to gradientMapping in GlassIcons
      label: "Image Verification",
      onClick: () => console.log("Image Verification Clicked"),
    },
    {
      icon: <ZapIcon className="w-full h-full text-sky-100" />,
      color: 'indigo',
      label: "Secure Processing",
      onClick: () => console.log("Secure Processing Clicked"),
    },
    {
      icon: <SearchIcon className="w-full h-full text-sky-100" />,
      color: 'purple',
      label: "AI Fraud Detection",
      onClick: () => console.log("AI Fraud Detection Clicked"),
    },
    {
      icon: <CheckCircleIcon className="w-full h-full text-sky-100" />,
      color: 'green',
      label: "Policy Sync",
      onClick: () => console.log("Policy Sync Clicked"),
    },
  ];

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

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Powered by SecureAI Technology</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {glassIconItems.map((item, index) => (
              <div key={index} className="flex flex-col items-center p-4 rounded-lg bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  {React.cloneElement(item.icon, { className: "w-6 h-6 text-blue-300" })}
                </div>
                <span className="text-sm font-medium text-slate-300 text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

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