import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { FileTextIcon, CheckCircleIcon, PlusCircleIcon, AlertTriangleIcon, ShieldCheckIcon, BellIcon } from '../common/Icon';
import { UserRole } from '../../types';
import { Button } from '../common/Button';
import { ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LoadingSpinner } from '../common/LoadingSpinner';
import Masonry, { MasonryDataItem } from '../common/Masonry';

const initialClaimsByMonthData: { name: string; Submitted: number; Approved: number; Rejected: number }[] = [
  { name: 'Jan', Submitted: 0, Approved: 0, Rejected: 0 },
  { name: 'Feb', Submitted: 0, Approved: 0, Rejected: 0 },
  { name: 'Mar', Submitted: 0, Approved: 0, Rejected: 0 },
  { name: 'Apr', Submitted: 0, Approved: 0, Rejected: 0 },
  { name: 'May', Submitted: 0, Approved: 0, Rejected: 0 },
  { name: 'Jun', Submitted: 0, Approved: 0, Rejected: 0 },
];

const initialRiskScoreTrendData: { name: string; avgRiskScore: number }[] = [
  { name: 'Week 1', avgRiskScore: 0 },
  { name: 'Week 2', avgRiskScore: 0 },
  { name: 'Week 3', avgRiskScore: 0 },
  { name: 'Week 4', avgRiskScore: 0 },
  { name: 'Week 5', avgRiskScore: 0 },
];

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [totalClaims, setTotalClaims] = useState(0);
  const [openClaims, setOpenClaims] = useState(0);
  const [closedClaims, setClosedClaims] = useState(0);
  const [claimsByMonthData, setClaimsByMonthData] = useState(initialClaimsByMonthData);
  const [riskScoreTrendData, setRiskScoreTrendData] = useState(initialRiskScoreTrendData);
  const [isLoading, setIsLoading] = useState(true);
  const [urgentTasks, setUrgentTasks] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [fraudAlerts, setFraudAlerts] = useState(0);
  const [myClaimsCount, setMyClaimsCount] = useState(0);
  const [activePolicies, setActivePolicies] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isInsurer = user?.role === UserRole.INSURER_PARTY;
      
      if (isInsurer) {
        // Insurer-specific data
        setTotalClaims(125);
        setOpenClaims(30);
        setClosedClaims(95);
        setUrgentTasks(8);
        setPendingApprovals(15);
        setFraudAlerts(3);
        setClaimsByMonthData([
          { name: 'Jan', Submitted: 20, Approved: 15, Rejected: 2 },
          { name: 'Feb', Submitted: 25, Approved: 18, Rejected: 3 },
          { name: 'Mar', Submitted: 30, Approved: 22, Rejected: 4 },
          { name: 'Apr', Submitted: 28, Approved: 25, Rejected: 1 },
          { name: 'May', Submitted: 35, Approved: 30, Rejected: 2 },
          { name: 'Jun', Submitted: 40, Approved: 33, Rejected: 5 },
        ]);
        setRiskScoreTrendData([
          { name: 'Week 1', avgRiskScore: 65 },
          { name: 'Week 2', avgRiskScore: 68 },
          { name: 'Week 3', avgRiskScore: 62 },
          { name: 'Week 4', avgRiskScore: 70 },
          { name: 'Week 5', avgRiskScore: 67 },
        ]);
      } else {
        // Policyholder-specific data
        setMyClaimsCount(3);
        setActivePolicies(1);
        setOpenClaims(1);
        setClosedClaims(2);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [user?.role]);

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }
  
  const isInsurer = user?.role === UserRole.INSURER_PARTY;
  const noChartData = (chartData: any[]) => chartData.every(item => Object.values(item).slice(1).every(val => val === 0));

  const getDashboardItems = (): MasonryDataItem[] => {
    if (isInsurer) {
      // Insurer dashboard items
      return [
        {
          id: 'total-claims',
          height: 180,
          renderContent: () => (
            <PixelCard title="Total Claims" variant="blue" icon={<FileTextIcon className="h-6 w-6 text-blue-400" />}>
              <p className="text-3xl font-bold text-text-on-dark-primary">{totalClaims}</p>
              <p className="text-sm text-text-on-dark-secondary">{totalClaims === 0 ? "No claims recorded yet." : "All claims in system"}</p>
            </PixelCard>
          ),
        },
        {
          id: 'urgent-tasks',
          height: 180,
          renderContent: () => (
            <Link to={ROUTES.TASKS_OVERVIEW}>
              <PixelCard title="Urgent Tasks" variant="blue" icon={<AlertTriangleIcon className="h-6 w-6 text-red-400" />}>
                <p className="text-3xl font-bold text-red-400">{urgentTasks}</p>
                <p className="text-sm text-text-on-dark-secondary">{urgentTasks === 0 ? "No urgent tasks" : "Require immediate attention"}</p>
              </PixelCard>
            </Link>
          ),
        },
        {
          id: 'pending-approvals',
          height: 180,
          renderContent: () => (
            <PixelCard title="Pending Approvals" variant="blue" icon={<CheckCircleIcon className="h-6 w-6 text-yellow-400" />}>
              <p className="text-3xl font-bold text-yellow-400">{pendingApprovals}</p>
              <p className="text-sm text-text-on-dark-secondary">{pendingApprovals === 0 ? "No pending approvals" : "Awaiting your review"}</p>
            </PixelCard>
          ),
        },
        {
          id: 'fraud-alerts',
          height: 180,
          renderContent: () => (
            <PixelCard title="Fraud Alerts" variant="blue" icon={<ShieldCheckIcon className="h-6 w-6 text-orange-400" />}>
              <p className="text-3xl font-bold text-orange-400">{fraudAlerts}</p>
              <p className="text-sm text-text-on-dark-secondary">{fraudAlerts === 0 ? "No fraud alerts" : "Suspicious activity detected"}</p>
            </PixelCard>
          ),
        },
      ];
    } else {
      // Enhanced Policyholder Dashboard
      return [
        {
          id: 'my-claims',
          height: 180,
          renderContent: () => (
            <Link to={ROUTES.CLAIMS}>
              <PixelCard title="My Claims" variant="blue" icon={<FileTextIcon className="h-6 w-6 text-blue-400" />}>
                <p className="text-3xl font-bold text-text-on-dark-primary">{myClaimsCount}</p>
                <p className="text-sm text-text-on-dark-secondary">{myClaimsCount === 0 ? "No claims submitted yet" : "Click to view details"}</p>
              </PixelCard>
            </Link>
          ),
        },
        {
          id: 'active-policies',
          height: 180,
          renderContent: () => (
            <Link to={ROUTES.MY_POLICY}>
              <PixelCard title="Active Policies" variant="blue" icon={<ShieldCheckIcon className="h-6 w-6 text-green-400" />}>
                <p className="text-3xl font-bold text-green-400">{activePolicies}</p>
                <p className="text-sm text-text-on-dark-secondary">{activePolicies === 0 ? "No active policies" : "Coverage active"}</p>
              </PixelCard>
            </Link>
          ),
        },
        {
          id: 'ai-insights',
          height: 250,
          renderContent: () => (
            <PixelCard title="AI Risk Insights" variant="blue">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-text-on-dark-primary">Low Risk Profile</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Driving Score</span>
                    <span className="text-green-400">92/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Claim History</span>
                    <span className="text-green-400">Excellent</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Fraud Risk</span>
                    <span className="text-green-400">Very Low</span>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-700 p-3 rounded">
                  <div className="text-green-400 text-sm font-medium">💡 AI Tip</div>
                  <div className="text-text-on-dark-secondary text-sm mt-1">
                    Your excellent driving record qualifies you for a 15% discount renewal!
                  </div>
                </div>
              </div>
            </PixelCard>
          ),
        },
        {
          id: 'quick-actions',
          height: 250,
          renderContent: () => (
            <PixelCard title="Quick Actions" variant="blue">
              <div className="space-y-4">
                <Button 
                  variant="primary" 
                  className="w-full"
                  leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                  onClick={() => navigate(ROUTES.NEW_CLAIM)}
                >
                  Start New Claim
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate(ROUTES.MY_POLICY)}
                >
                  View My Policy
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate(ROUTES.HELP_CONTACT_SUPPORT)}
                >
                  Contact Support
                </Button>
              </div>
            </PixelCard>
          ),
        },
      ];
    }
  };

  return (
    <div>
      <PageHeader 
        title={isInsurer ? "Insurer Dashboard" : "My Dashboard"} 
        subtitle={isInsurer ? `Claims management overview for ${user?.name || 'Adjuster'}` : `Welcome back, ${user?.name || 'User'}!`}
        actions={
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              leftIcon={<BellIcon className="h-5 w-5" />}
              onClick={() => navigate(ROUTES.NOTIFICATIONS_OVERVIEW)}
            >
              Notifications
            </Button>
            {!isInsurer && (
              <Button 
                variant="primary" 
                leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                onClick={() => navigate(ROUTES.NEW_CLAIM)}
              >
                Start New Claim
              </Button>
            )}
          </div>
        }
      />
      <Masonry 
        data={getDashboardItems()}
        columnsConfig={{ default: 1, sm: 1, md: 2, lg: isInsurer ? 2 : 3, xl: isInsurer ? 3 : 3}}
        columnGap={24}
      />
    </div>
  );
};