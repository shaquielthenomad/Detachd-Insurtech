import React from 'react';
import { UserCircleIcon } from '../common/Icon'; 
import { useSecureAuth } from '../../contexts/SecureAuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface HeaderProps {
  appName: string;
  onMenuButtonClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { user } = useSecureAuth();

  return (
    <header className="relative bg-card-bg shadow-md z-10"> {/* card-bg is white */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-text-dim hover:text-text-light hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" // ring-primary is blue
              onClick={onMenuButtonClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            {user ? (
              <Link to={ROUTES.PROFILE} className="flex items-center group">
                <span className="text-sm font-medium text-text-dim group-hover:text-primary mr-2 hidden sm:block">{user.name}</span> {/* hover:text-primary (blue) */}
                {user.avatarUrl ? (
                    <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                ) : (
                    <UserCircleIcon className="h-8 w-8 text-text-dim group-hover:text-primary" />
                )}
              </Link>
            ) : (
              <span className="text-sm font-medium text-text-dim">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};