import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, APP_NAME } from '../../constants';
import { UserRole } from '../../types'; 
import LetterGlitch from '../common/LetterGlitch';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      let demoRole = UserRole.POLICYHOLDER;
      let demoName = "Demo User";
      if (email.includes('adjuster')) {
        demoRole = UserRole.INSURER_PARTY;
        demoName = "Sarah Chen (Adjuster)";
      } else if (email.includes('admin')) {
        demoRole = UserRole.INSURER_PARTY;
        demoName = "Admin User";
      }

      await login(email, demoName, demoRole);
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Or{' '}
          <Link to={ROUTES.WELCOME} className="font-medium text-sky-400 hover:text-sky-300">
            return to welcome screen
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Card background will be semi-transparent dark to show glitch through, inputs will be standard light theme */}
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
              // Input itself is light-themed, label color needs to be light
              containerClassName="[&>label]:text-slate-200" 
            />
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              containerClassName="[&>label]:text-slate-200"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-sky-400 hover:text-sky-300"> 
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <Button type="submit" className="w-full" isLoading={loading}>
                Log in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" /> 
              </div>
              <div className="relative flex justify-center text-sm">
                 {/* Span bg matches card bg to "cut through" the line */}
                <span className="px-2 bg-slate-800/0 text-slate-300">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-slate-300 text-slate-100 hover:bg-slate-700 hover:border-slate-200" 
                onClick={() => navigate(ROUTES.ONBOARDING_ROLE_SELECTION)}
              > 
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
