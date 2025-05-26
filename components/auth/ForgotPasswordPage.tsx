import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ROUTES } from '../../constants';

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
      <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-400 mb-6">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Check your email
            </h2>
            <p className="text-slate-300">
              We've sent password reset instructions to <strong className="text-white">{email}</strong>
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
            <div className="text-center space-y-4">
              <p className="text-slate-300">
                If you don't see the email, check your spam folder or try again.
              </p>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                <p className="text-sm text-slate-300 mb-3">Open your email app:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className="px-3 py-2 text-sm border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    onClick={() => window.open('mailto:', '_blank')}
                  >
                    Mail
                  </button>
                  <button 
                    className="px-3 py-2 text-sm border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    onClick={() => window.open('https://outlook.live.com', '_blank')}
                  >
                    Outlook
                  </button>
                  <button 
                    className="px-3 py-2 text-sm border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    onClick={() => window.open('https://gmail.com', '_blank')}
                  >
                    Gmail
                  </button>
                </div>
              </div>

              <div className="text-left bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-2">Need help? Contact us:</p>
                <p className="text-sm text-white">
                  📧 <a href="mailto:info@detachd.systems" className="text-blue-400 hover:text-blue-300">info@detachd.systems</a>
                </p>
                <p className="text-sm text-white mt-1">
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
                  <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                    Return to Login
                  </button>
                </Link>
                <button 
                  className="w-full py-2 px-4 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Reset your password
          </h2>
          <p className="text-slate-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 