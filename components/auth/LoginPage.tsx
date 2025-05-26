import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Demo accounts for testing
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
    setError('');
    
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-on-dark-primary mb-2">
            Sign in to Detachd
          </h2>
          <p className="text-text-on-dark-secondary">
            Secure insurance claim management platform
          </p>
        </div>
        
        <div className="bg-medium rounded-lg p-8 border border-light">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-on-dark-primary mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 bg-dark border border-light rounded-md text-text-on-dark-primary placeholder-text-on-dark-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-on-dark-primary mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 bg-dark border border-light rounded-md text-text-on-dark-primary placeholder-text-on-dark-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </Link>
              <Link
                to="/onboarding"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-light">
            <h3 className="text-lg font-medium text-text-on-dark-primary mb-4">Demo Accounts</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 bg-dark hover:bg-light rounded-md border border-light transition-colors disabled:opacity-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text-on-dark-primary">{account.role}</span>
                    <span className="text-xs text-text-on-dark-secondary">{account.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-on-dark-secondary">
              Click any demo account to login instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


