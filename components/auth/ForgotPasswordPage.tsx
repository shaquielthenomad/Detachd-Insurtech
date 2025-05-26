import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ROUTES, APP_NAME } from '../../constants';
import LetterGlitch from '../common/LetterGlitch';
import { MailIcon } from '../common/Icon';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
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
            <MailIcon className="mx-auto h-12 w-12 text-green-400" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-slate-300">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            <div className="text-center space-y-4">
              <p className="text-slate-300">
                If you don't see the email, check your spam folder or try again.
              </p>
              
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-300 mb-3">Open your email app:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-500 text-slate-300 hover:bg-slate-600"
                    onClick={() => window.open('mailto:', '_blank')}
                  >
                    Mail
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-500 text-slate-300 hover:bg-slate-600"
                    onClick={() => window.open('https://outlook.live.com', '_blank')}
                  >
                    Outlook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-500 text-slate-300 hover:bg-slate-600"
                    onClick={() => window.open('https://gmail.com', '_blank')}
                  >
                    Gmail
                  </Button>
                </div>
              </div>

              <div className="text-left bg-slate-700/30 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Need help? Contact us:</p>
                <p className="text-sm text-slate-300">
                  📧 <a href="mailto:info@detachd.systems" className="text-blue-400 hover:text-blue-300">info@detachd.systems</a>
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  📞 <a href="tel:+27123456789" className="text-blue-400 hover:text-blue-300">+27 12 345 6789</a>
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Detachd Pty Ltd | Enterprise Number: 2021/792488/07
                </p>
                <p className="text-xs text-slate-400">
                  Founded by <a href="https://www.linkedin.com/in/shaquiel-sewell/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Shaquiel Sewell</a>
                </p>
              </div>
              
              <div className="space-y-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" className="w-full">
                    Return to Login
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-300 hover:bg-slate-700"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try different email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-text-on-dark-primary mb-2">
            Reset your password
          </h2>
          <p className="text-text-on-dark-secondary">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/70 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              containerClassName="[&>label]:text-slate-200" 
            />
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send reset instructions
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link to={ROUTES.LOGIN} className="font-medium text-sky-400 hover:text-sky-300">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 