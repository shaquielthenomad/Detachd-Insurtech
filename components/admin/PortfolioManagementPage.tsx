import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheckIcon, UsersIcon, BarChartIcon, CheckCircleIcon, AlertTriangleIcon } from '../common/Icon';

interface InsurerPortfolio {
  id: string;
  name: string;
  shortName: string;
  activePolicies: number;
  totalPremium: number;
  claimsThisMonth: number;
  lastActive: string;
  status: 'active' | 'inactive';
  logo?: string;
}

interface PortfolioStats {
  totalInsurers: number;
  totalPolicies: number;
  totalPremium: number;
  activeClaims: number;
}

const mockPortfolios: InsurerPortfolio[] = [
  {
    id: '1',
    name: 'Santam Insurance',
    shortName: 'Santam',
    activePolicies: 1247,
    totalPremium: 15600000,
    claimsThisMonth: 23,
    lastActive: '2024-01-20',
    status: 'active',
  },
  {
    id: '2',
    name: 'Old Mutual Insure',
    shortName: 'Old Mutual',
    activePolicies: 892,
    totalPremium: 11200000,
    claimsThisMonth: 18,
    lastActive: '2024-01-19',
    status: 'active',
  },
  {
    id: '3',
    name: 'Discovery Insure',
    shortName: 'Discovery',
    activePolicies: 567,
    totalPremium: 8900000,
    claimsThisMonth: 12,
    lastActive: '2024-01-18',
    status: 'active',
  },
  {
    id: '4',
    name: 'Hollard Insurance',
    shortName: 'Hollard',
    activePolicies: 234,
    totalPremium: 3200000,
    claimsThisMonth: 5,
    lastActive: '2024-01-15',
    status: 'inactive',
  },
];

export const PortfolioManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<InsurerPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInsurers: 0,
    totalPolicies: 0,
    totalPremium: 0,
    activeClaims: 0,
  });

  useEffect(() => {
    const fetchPortfolios = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPortfolios(mockPortfolios);
      
      // Calculate stats
      const totalInsurers = mockPortfolios.filter(p => p.status === 'active').length;
      const totalPolicies = mockPortfolios.reduce((sum, p) => sum + p.activePolicies, 0);
      const totalPremium = mockPortfolios.reduce((sum, p) => sum + p.totalPremium, 0);
      const activeClaims = mockPortfolios.reduce((sum, p) => sum + p.claimsThisMonth, 0);
      
      setStats({ totalInsurers, totalPolicies, totalPremium, activeClaims });
      setIsLoading(false);
    };

    fetchPortfolios();
  }, []);

  const handlePortfolioSwitch = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
    // Here you would typically update the context or store to switch the active portfolio
    // For now, we'll just update the local state
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading portfolio data..." />;
  }

  // Check if user is authorized
  const isAuthorized = user?.role === 'insurer_admin' || user?.role === 'super_admin';
  
  if (!isAuthorized) {
    return (
      <div>
        <PageHeader title="Access Denied" />
        <PixelCard variant="blue">
          <div className="text-center py-8">
            <AlertTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-on-dark-primary mb-2">Access Restricted</h3>
            <p className="text-text-on-dark-secondary">
              Portfolio management is only available for insurance administrators.
            </p>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Portfolio Management" 
        subtitle="Manage multiple insurer portfolios and switch between different insurance companies"
      />
      
      {/* Portfolio Overview Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PixelCard variant="blue" className="p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-text-on-dark-primary">{stats.totalInsurers}</p>
              <p className="text-sm text-text-on-dark-secondary">Active Insurers</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard variant="blue" className="p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.totalPolicies.toLocaleString()}</p>
              <p className="text-sm text-text-on-dark-secondary">Total Policies</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard variant="blue" className="p-6">
          <div className="flex items-center">
            <BarChartIcon className="h-8 w-8 text-purple-400 mr-4 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.totalPremium / 1000000)}M</p>
              <p className="text-sm text-text-on-dark-secondary">Total Premium</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard variant="blue" className="p-6">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-8 w-8 text-yellow-400 mr-4 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-yellow-400">{stats.activeClaims}</p>
              <p className="text-sm text-text-on-dark-secondary">Active Claims</p>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Portfolio Grid */}
      <div className="mt-8">
        <PixelCard variant="blue" title="Insurance Portfolios" icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className={`p-6 border rounded-lg transition-all cursor-pointer ${
                  selectedPortfolio === portfolio.id
                    ? 'border-blue-400 bg-blue-900/20'
                    : portfolio.status === 'active' 
                    ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                    : 'border-slate-700 opacity-60'
                }`}
                onClick={() => portfolio.status === 'active' && handlePortfolioSwitch(portfolio.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-on-dark-primary">
                      {portfolio.name}
                    </h3>
                    <p className="text-sm text-text-on-dark-secondary">
                      {portfolio.shortName}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    portfolio.status === 'active' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {portfolio.status === 'active' ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <AlertTriangleIcon className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium capitalize">
                      {portfolio.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-on-dark-secondary">Active Policies:</span>
                    <span className="text-sm font-semibold text-text-on-dark-primary">
                      {portfolio.activePolicies.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-on-dark-secondary">Total Premium:</span>
                    <span className="text-sm font-semibold text-text-on-dark-primary">
                      {formatCurrency(portfolio.totalPremium / 1000000)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-on-dark-secondary">Claims This Month:</span>
                    <span className="text-sm font-semibold text-yellow-400">
                      {portfolio.claimsThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-on-dark-secondary">Last Active:</span>
                    <span className="text-xs text-text-on-dark-secondary">
                      {formatDate(portfolio.lastActive)}
                    </span>
                  </div>
                </div>
                
                {portfolio.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <Button
                      variant={selectedPortfolio === portfolio.id ? "primary" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortfolioSwitch(portfolio.id);
                      }}
                    >
                      {selectedPortfolio === portfolio.id ? "Active Portfolio" : "Switch to Portfolio"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelCard>
      </div>

      {/* Selected Portfolio Details */}
      {selectedPortfolio && (
        <div className="mt-8">
          <PixelCard variant="blue" title="Current Portfolio" icon={<CheckCircleIcon className="h-5 w-5 text-green-400" />}>
            {(() => {
              const portfolio = portfolios.find(p => p.id === selectedPortfolio);
              if (!portfolio) return null;
              
              return (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        You are now managing: {portfolio.name}
                      </h3>
                      <p className="text-sm text-text-on-dark-secondary">
                        All dashboard data, claims, and reports will now show information for {portfolio.name}.
                        You can switch to a different portfolio at any time.
                      </p>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-green-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })()}
          </PixelCard>
        </div>
      )}
    </div>
  );
}; 