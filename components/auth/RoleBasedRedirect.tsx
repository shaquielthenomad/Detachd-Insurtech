import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRedirectProps {
  fallbackRoute?: string;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ fallbackRoute = '/dashboard' }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const getDefaultRoute = (role: string): string => {
      switch (role) {
        case 'super_admin':
          return '/dashboard'; // Super admin gets full dashboard
        case 'insurer_admin':
        case 'insurer_party':
          return '/dashboard'; // Insurer gets full dashboard
        case 'policyholder':
          return '/dashboard'; // Policyholder gets full dashboard
        case 'witness':
          return '/witness/claims'; // Witness gets minimal claim view
        case 'medical_professional':
          return '/medical/join-claim'; // Medical pro gets QR scanner
        case 'third_party':
          return '/witness/claims'; // Third party similar to witness
        default:
          return fallbackRoute;
      }
    };

    const defaultRoute = getDefaultRoute(user.role);
    navigate(defaultRoute, { replace: true });
  }, [user, isAuthenticated, navigate, fallbackRoute]);

  return null;
}; 