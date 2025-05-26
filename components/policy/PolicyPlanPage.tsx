import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { ShieldCheckIcon, CalendarIcon, CreditCardIcon, AlertTriangleIcon, CheckCircleIcon, PlusCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface PolicyPlan {
  id: string;
  policyNumber: string;
  planType: string;
  coverage: string;
  premium: number;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string;
  insurer: string;
  coverageDetails: {
    vehicleDamage?: number;
    thirdParty?: number;
    theft?: number;
    personalAccident?: number;
  };
}

export const PolicyPlanPage: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPolicies: PolicyPlan[] = [
        {
          id: '1',
          policyNumber: 'DET-POL-001',
          planType: 'Comprehensive Motor Insurance',
          coverage: 'Full Coverage',
          premium: 1250.00,
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          insurer: 'Santam Insurance',
          coverageDetails: {
            vehicleDamage: 500000,
            thirdParty: 2000000,
            theft: 500000,
            personalAccident: 100000,
          }
        },
        {
          id: '2',
          policyNumber: 'DET-POL-002',
          planType: 'Third Party Only',
          coverage: 'Basic Coverage',
          premium: 450.00,
          status: 'expired',
          startDate: '2023-06-01',
          endDate: '2024-05-31',
          insurer: 'Discovery Insure',
          coverageDetails: {
            thirdParty: 1000000,
          }
        }
      ];
      
      setPolicies(mockPolicies);
      setIsLoading(false);
    };

    fetchPolicies();
  }, []);

  const getStatusIcon = (status: PolicyPlan['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'expired':
        return <AlertTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'pending':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'cancelled':
        return <AlertTriangleIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusText = (status: PolicyPlan['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your policies..." />;
  }

  return (
    <div>
      <PageHeader 
        title="My Policy Plans" 
        subtitle="Manage your insurance policies and coverage"
        actions={
          <Button 
            variant="primary" 
            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
            onClick={() => navigate(ROUTES.NEW_POLICY)}
          >
            Add New Policy
          </Button>
        }
      />
      
      <div className="space-y-6">
        {/* Policy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PixelCard variant="blue" title="Active Policies">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {policies.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-text-on-dark-secondary">Currently active</p>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" title="Total Premium">
            <div className="text-center">
              <p className="text-3xl font-bold text-text-on-dark-primary">
                {formatCurrency(policies
                  .filter(p => p.status === 'active')
                  .reduce((sum, p) => sum + p.premium, 0)
                )}
              </p>
              <p className="text-sm text-text-on-dark-secondary">Monthly total</p>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" title="Coverage Status">
            <div className="text-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-text-on-dark-secondary">Fully covered</p>
            </div>
          </PixelCard>
        </div>

        {/* Policy List */}
        <div className="space-y-4">
          {policies.map((policy) => (
            <PixelCard key={policy.id} variant="blue">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(policy.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-text-on-dark-primary">
                        {policy.planType}
                      </h3>
                      <p className="text-sm text-text-on-dark-secondary">
                        Policy #{policy.policyNumber} • {policy.insurer}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'active' 
                        ? 'bg-green-900/30 text-green-300' 
                        : policy.status === 'expired'
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {getStatusText(policy.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-text-on-dark-secondary">Monthly Premium</p>
                        <p className="font-semibold text-text-on-dark-primary">
                          {formatCurrency(policy.premium)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-text-on-dark-secondary">Policy Period</p>
                        <p className="font-semibold text-text-on-dark-primary">
                          {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-text-on-dark-secondary">Coverage</p>
                        <p className="font-semibold text-text-on-dark-primary">
                          {policy.coverage}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coverage Details */}
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-text-on-dark-primary mb-2">Coverage Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {policy.coverageDetails.vehicleDamage && (
                        <div>
                          <p className="text-text-on-dark-secondary">Vehicle Damage</p>
                          <p className="font-semibold text-text-on-dark-primary">
                            {formatCurrency(policy.coverageDetails.vehicleDamage)}
                          </p>
                        </div>
                      )}
                      {policy.coverageDetails.thirdParty && (
                        <div>
                          <p className="text-text-on-dark-secondary">Third Party</p>
                          <p className="font-semibold text-text-on-dark-primary">
                            {formatCurrency(policy.coverageDetails.thirdParty)}
                          </p>
                        </div>
                      )}
                      {policy.coverageDetails.theft && (
                        <div>
                          <p className="text-text-on-dark-secondary">Theft Cover</p>
                          <p className="font-semibold text-text-on-dark-primary">
                            {formatCurrency(policy.coverageDetails.theft)}
                          </p>
                        </div>
                      )}
                      {policy.coverageDetails.personalAccident && (
                        <div>
                          <p className="text-text-on-dark-secondary">Personal Accident</p>
                          <p className="font-semibold text-text-on-dark-primary">
                            {formatCurrency(policy.coverageDetails.personalAccident)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`${ROUTES.MY_POLICY}/${policy.id}`)}
                  >
                    View Details
                  </Button>
                  {policy.status === 'active' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(ROUTES.NEW_CLAIM)}
                    >
                      File Claim
                    </Button>
                  )}
                  {policy.status === 'expired' && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(ROUTES.NEW_POLICY)}
                    >
                      Renew Policy
                    </Button>
                  )}
                </div>
              </div>
            </PixelCard>
          ))}
        </div>

        {policies.length === 0 && (
          <PixelCard variant="blue">
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
              <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No policies found</h3>
              <p className="mt-1 text-sm text-text-on-dark-secondary">
                Get started by adding your first policy.
              </p>
              <div className="mt-6">
                <Button 
                  variant="primary"
                  onClick={() => navigate(ROUTES.NEW_POLICY)}
                >
                  Add Policy
                </Button>
              </div>
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
}; 