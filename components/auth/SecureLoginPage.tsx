import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSecureAuth } from '../../contexts/SecureAuthContext';
import { validateLoginForm, isValidEmail } from '../../utils/validation';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const SecureLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading, error: authError, clearError } = useSecureAuth();
  const navigate = useNavigate();

  // Clear errors when user starts typing
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    try {
      // Client-side validation
      const validation = validateLoginForm(email, password);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      await login(email.trim().toLowerCase(), password);
      
      // Successful login - navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      // Error is handled by AuthContext and displayed via authError
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear email error as user types
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    
    // Clear auth error
    if (authError) {
      clearError();
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear password error as user types
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    
    // Clear auth error
    if (authError) {
      clearError();
    }
  };

  // Demo accounts for development/testing
  const demoAccounts = [
    { email: 'admin@detachd.com', role: 'Super Admin', password: 'admin123' },
    { email: 'insurer@detachd.com', role: 'Insurer Admin', password: 'insurer123' },
    { email: 'policyholder@detachd.com', role: 'Policyholder', password: 'policy123' },
    { email: 'witness@detachd.com', role: 'Witness', password: 'witness123' },
    { email: 'doctor@detachd.com', role: 'Medical Professional', password: 'doctor123' }
  ];

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const isFormValid = email.trim() && password && isValidEmail(email.trim());
  const currentError = authError || Object.values(errors).find(Boolean);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Sign in to Detachd
          </h2>
          <p className="text-slate-300">
            Secure insurance claim management platform
          </p>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              placeholder="Enter your email"
              disabled={isLoading || authLoading}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
              containerClassName="[&>label]:text-white"
            />

            <div className="relative">
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                error={errors.password}
                placeholder="Enter your password"
                disabled={isLoading || authLoading}
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                containerClassName="[&>label]:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-300 focus:outline-none"
                disabled={isLoading || authLoading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {currentError && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {currentError}
                </div>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading || authLoading}
              disabled={!isFormValid || isLoading || authLoading}
              className="w-full"
            >
              {isLoading || authLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:underline"
              >
                Forgot your password?
              </Link>
              <Link
                to="/onboarding/role"
                className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:underline"
              >
                Create account
              </Link>
            </div>
          </form>

          {/* Demo Accounts Section - Only show in development */}
          {(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-medium text-white mb-4">Demo Accounts</h3>
              <div className="space-y-2">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={isLoading || authLoading}
                    className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{account.role}</span>
                      <span className="text-xs text-slate-400">{account.email}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Click any demo account to login instantly (Development mode only)
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Protected by enterprise-grade security. Your data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
}; 