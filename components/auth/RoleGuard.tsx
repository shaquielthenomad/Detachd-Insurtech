import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  redirectTo,
  showAccessDenied = true 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-slate-900 p-6">
          <PageHeader title="Access Denied" subtitle="You don't have permission to view this page." />
          <PixelCard variant="red" className="text-center">
            <div className="py-8">
              <h3 className="text-xl font-bold text-text-on-dark-primary mb-4">Access Restricted</h3>
              <p className="text-text-on-dark-secondary mb-4">
                This page is only available to: {allowedRoles.join(', ')}
              </p>
              <p className="text-text-on-dark-secondary mb-6">
                Your role: {user.role}
              </p>
              <Button 
                variant="primary" 
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </PixelCard>
        </div>
      );
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 