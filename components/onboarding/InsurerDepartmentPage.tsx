import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { UsersIcon, ShieldCheckIcon, ChartBarIcon, CogIcon, AlertTriangleIcon } from '../common/Icon';

interface DepartmentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  requiresSecureLedger?: boolean;
}

const departmentOptions: DepartmentOption[] = [
  {
    id: 'claims',
    name: 'Claims Department',
    description: 'Review, process, and manage insurance claims',
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    route: ROUTES.DASHBOARD,
    requiresSecureLedger: true,
  },
  {
    id: 'underwriting',
    name: 'Underwriting',
    description: 'Risk assessment and policy evaluation',
    icon: <ChartBarIcon className="h-6 w-6" />,
    route: ROUTES.ANALYTICS,
    requiresSecureLedger: true,
  },
  {
    id: 'fraud_investigation',
    name: 'Fraud Investigation',
    description: 'Investigate suspicious claims and fraud detection',
    icon: <AlertTriangleIcon className="h-6 w-6" />,
    route: ROUTES.TASKS_OVERVIEW,
    requiresSecureLedger: true,
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'User management and system administration',
    icon: <CogIcon className="h-6 w-6" />,
    route: ROUTES.TEAM,
    requiresSecureLedger: false,
  },
];

export const InsurerDepartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole;
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setError('');
  };

  const handleContinue = async () => {
    if (!selectedDepartment) {
      setError('Please select your department to continue.');
      return;
    }

    const department = departmentOptions.find(d => d.id === selectedDepartment);
    if (!department) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    if (department.requiresSecureLedger) {
      // Navigate to verification status with SecureLedger requirement
      navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
        state: { 
          success: true, 
          userName: "Insurance Professional",
          userRole: role,
          department: department.name,
          targetRoute: department.route,
          requiresSecureLedger: true
        } 
      });
    } else {
      // Direct navigation for admin roles
      navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
        state: { 
          success: true, 
          userName: "System Administrator",
          userRole: role,
          department: department.name,
          targetRoute: department.route
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Department Selection" 
        subtitle="Select your department to access the appropriate tools"
        showBackButton 
        backButtonPath={ROUTES.ONBOARDING_ROLE_SELECTION}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <UsersIcon className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary">
                Choose Your Department
              </h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary">
              Each department has specialized tools and access levels designed for your specific role.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {departmentOptions.map((department) => (
              <button
                key={department.id}
                onClick={() => handleDepartmentSelect(department.id)}
                className={`text-left p-4 border rounded-lg transition-all duration-150 ease-in-out ${
                  selectedDepartment === department.id 
                    ? 'border-blue-400 ring-2 ring-blue-400 bg-blue-700/30' 
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    selectedDepartment === department.id ? 'bg-blue-600/30' : 'bg-slate-700/50'
                  }`}>
                    <div className={`${
                      selectedDepartment === department.id ? 'text-blue-300' : 'text-slate-400'
                    }`}>
                      {department.icon}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className={`font-medium ${
                      selectedDepartment === department.id ? 'text-blue-200' : 'text-text-on-dark-primary'
                    }`}>
                      {department.name}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      selectedDepartment === department.id ? 'text-blue-300' : 'text-text-on-dark-secondary'
                    }`}>
                      {department.description}
                    </p>
                    {department.requiresSecureLedger && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-900/30 text-purple-300 border border-purple-600/30">
                          SecureLedger Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-slate-700/30 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-text-on-dark-primary mb-2">Important:</h4>
            <ul className="text-sm text-text-on-dark-secondary space-y-1">
              <li>• SecureLedger credentials are required for most departments</li>
              <li>• If you forgot your SecureLedger password, you'll be redirected to support</li>
              <li>• Each department has specialized dashboards and tools</li>
              <li>• Your access level will be determined by your department selection</li>
            </ul>
          </div>
          
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          
          <Button 
            onClick={handleContinue}
            className="w-full" 
            isLoading={isLoading}
            disabled={!selectedDepartment}
          >
            Continue to {selectedDepartment ? departmentOptions.find(d => d.id === selectedDepartment)?.name : 'Selected Department'}
          </Button>
        </PixelCard>
      </div>
    </div>
  );
}; 