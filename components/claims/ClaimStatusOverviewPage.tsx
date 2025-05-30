import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ClaimStatus } from '../../types';
import { ROUTES } from '../../constants';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  EyeIcon
} from '../common/Icon';

interface ClaimSummary {
  status: ClaimStatus;
  count: number;
  percentage: number;
  avgProcessingTime?: string;
  recentChange?: number;
}

export const ClaimStatusOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [claimsSummary, setClaimsSummary] = useState<ClaimSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalClaims, setTotalClaims] = useState(0);

  useEffect(() => {
    const fetchClaimsData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isInsurer = user?.role === UserRole.INSURER_PARTY;
      
      if (isInsurer) {
        // Insurer view - all claims in system
        const summaryData: ClaimSummary[] = [
          {
            status: ClaimStatus.SUBMITTED,
            count: 45,
            percentage: 25,
            avgProcessingTime: '2.3 days',
            recentChange: 5
          },
          {
            status: ClaimStatus.IN_REVIEW,
            count: 32,
            percentage: 18,
            avgProcessingTime: '4.1 days',
            recentChange: -2
          },
          {
            status: ClaimStatus.PENDING_INFO,
            count: 28,
            percentage: 16,
            avgProcessingTime: '7.2 days',
            recentChange: 3
          },
          {
            status: ClaimStatus.APPROVED,
            count: 56,
            percentage: 31,
            avgProcessingTime: '5.8 days',
            recentChange: 8
          },
          {
            status: ClaimStatus.REJECTED,
            count: 12,
            percentage: 7,
            avgProcessingTime: '3.2 days',
            recentChange: -1
          },
          {
            status: ClaimStatus.CLOSED,
            count: 7,
            percentage: 4,
            avgProcessingTime: '12.5 days',
            recentChange: 2
          }
        ];
        setTotalClaims(180);
        setClaimsSummary(summaryData);
      } else {
        // Policyholder view - their claims only
        const summaryData: ClaimSummary[] = [
          {
            status: ClaimStatus.SUBMITTED,
            count: 1,
            percentage: 33,
            avgProcessingTime: '1 day',
          },
          {
            status: ClaimStatus.APPROVED,
            count: 2,
            percentage: 67,
            avgProcessingTime: '4 days',
          }
        ];
        setTotalClaims(3);
        setClaimsSummary(summaryData);
      }
      
      setIsLoading(false);
    };

    fetchClaimsData();
  }, [user?.role]);

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return <FileTextIcon className="h-6 w-6 text-blue-400" />;
      case ClaimStatus.IN_REVIEW:
        return <EyeIcon className="h-6 w-6 text-yellow-400" />;
      case ClaimStatus.PENDING_INFO:
        return <AlertTriangleIcon className="h-6 w-6 text-orange-400" />;
      case ClaimStatus.APPROVED:
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case ClaimStatus.REJECTED:
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case ClaimStatus.CLOSED:
        return <ClockIcon className="h-6 w-6 text-slate-400" />;
      default:
        return <FileTextIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return 'border-blue-400 bg-blue-900/20';
      case ClaimStatus.IN_REVIEW:
        return 'border-yellow-400 bg-yellow-900/20';
      case ClaimStatus.PENDING_INFO:
        return 'border-orange-400 bg-orange-900/20';
      case ClaimStatus.APPROVED:
        return 'border-green-400 bg-green-900/20';
      case ClaimStatus.REJECTED:
        return 'border-red-400 bg-red-900/20';
      case ClaimStatus.CLOSED:
        return 'border-slate-400 bg-slate-900/20';
      default:
        return 'border-blue-400 bg-blue-900/20';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading claim status data..." />;
  }

  const isInsurer = user?.role === UserRole.INSURER_PARTY;

  return (
    <div>
      <PageHeader 
        title="Claim Status Overview" 
        subtitle={isInsurer ? "System-wide claim status distribution" : "Your claim status summary"}
        actions={
          <Link to={ROUTES.CLAIMS}>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All Claims →
            </button>
          </Link>
        }
      />
      
      <div className="space-y-6">
        <PixelCard variant="blue">
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold text-text-on-dark-primary mb-2">{totalClaims}</h2>
            <p className="text-text-on-dark-secondary">
              {isInsurer ? "Total Claims in System" : "Your Total Claims"}
            </p>
          </div>
        </PixelCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimsSummary.map((summary) => (
            <PixelCard 
              key={summary.status} 
              variant="blue" 
              className={`border ${getStatusColor(summary.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(summary.status)}
                  <div>
                    <h3 className="font-semibold text-text-on-dark-primary">
                      {summary.status}
                    </h3>
                    <p className="text-sm text-text-on-dark-secondary">
                      {summary.percentage}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-on-dark-primary">
                    {summary.count}
                  </p>
                  {summary.recentChange && (
                    <p className={`text-xs ${
                      summary.recentChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {summary.recentChange > 0 ? '+' : ''}{summary.recentChange} this week
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-700 rounded h-2">
                  <div 
                    className="h-2 rounded bg-current opacity-60"
                    style={{ width: `${summary.percentage}%` }}
                  ></div>
                </div>
                
                {summary.avgProcessingTime && (
                  <p className="text-xs text-text-on-dark-secondary">
                    Avg. processing: {summary.avgProcessingTime}
                  </p>
                )}
              </div>
            </PixelCard>
          ))}
        </div>

        {isInsurer && (
          <PixelCard variant="blue">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-4">
              Processing Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-text-on-dark-secondary">Average Resolution Time</p>
                <p className="text-lg font-semibold text-text-on-dark-primary">5.2 days</p>
                <p className="text-xs text-green-400">↓ 0.8 days from last month</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-text-on-dark-secondary">Claims Requiring Attention</p>
                <p className="text-lg font-semibold text-orange-400">28</p>
                <p className="text-xs text-text-on-dark-secondary">Awaiting information</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-text-on-dark-secondary">Success Rate</p>
                <p className="text-lg font-semibold text-green-400">89.2%</p>
                <p className="text-xs text-green-400">↑ 2.1% from last month</p>
              </div>
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  );
}; 