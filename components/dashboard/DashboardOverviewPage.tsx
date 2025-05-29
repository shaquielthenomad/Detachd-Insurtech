import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { FileTextIcon, CheckCircleIcon, PlusCircleIcon, AlertTriangleIcon, ShieldCheckIcon, BellIcon, UsersIcon, ChartBarIcon, ExclamationTriangleIcon, ClockIcon, ZapIcon, EyeIcon, DownloadIcon, TrendingUpIcon } from '../common/Icon';
import { UserRole } from '../../types';
import { Button } from '../common/Button';
import { ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { LoadingSpinner } from '../common/LoadingSpinner';
import Masonry, { MasonryDataItem } from '../common/Masonry';

// Color palette for charts
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

const claimTypesData = [
  { name: 'Auto Accident', value: 40, color: '#3b82f6' },
  { name: 'Property Damage', value: 25, color: '#10b981' },
  { name: 'Medical', value: 20, color: '#f59e0b' },
  { name: 'Theft', value: 15, color: '#ef4444' },
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';
      const isPolicyholder = user?.role === 'policyholder';
      
      if (isInsurer) {
        // Insurer/Admin-specific data
        setTotalClaims(125);
        setOpenClaims(30);
        setClosedClaims(95);
        setUrgentTasks(8);
        setPendingApprovals(15);
        setFraudAlerts(3);
        setTotalUsers(1247);
        setMonthlyRevenue(2150000);
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
      } else if (isPolicyholder) {
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
  
  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';
  const isPolicyholder = user?.role === 'policyholder';
  const isWitness = user?.role === 'witness';

  // Role-specific dashboard content
  if (isWitness) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <PageHeader 
            title="Witness Dashboard" 
            subtitle="You have limited access to provide witness statements only."
          />
          
          <div className="mt-8 space-y-6">
            <PixelCard variant="blue" className="p-6">
              <div className="text-center py-12">
                <FileTextIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-on-dark-primary mb-2">No Active Claims</h3>
                <p className="text-text-on-dark-secondary mb-6">
                  You are not currently assigned as a witness on any claims.
                </p>
                <p className="text-sm text-text-on-dark-secondary">
                  When you are added as a witness to a claim, it will appear here for you to provide your statement.
                </p>
              </div>
            </PixelCard>
            
            <PixelCard variant="default" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-on-dark-primary">Account Settings</h4>
                  <p className="text-xs text-text-on-dark-secondary">Manage your profile and security settings</p>
                </div>
                <Link to={ROUTES.SETTINGS}>
                  <Button variant="secondary" size="sm">Settings</Button>
                </Link>
              </div>
            </PixelCard>
          </div>
        </div>
      </div>
    );
  }

  if (isPolicyholder) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <PageHeader 
            title={`Welcome back, ${user?.name || 'Policyholder'}`} 
            subtitle="Manage your insurance claims and policies"
          />
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to={ROUTES.CLAIMS} className="block">
              <PixelCard variant="blue" className="p-8 hover:bg-slate-800/50 transition-colors h-full">
                <div className="flex items-center">
                  <FileTextIcon className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-text-on-dark-primary">{myClaimsCount}</p>
                    <p className="text-sm text-text-on-dark-secondary">My Claims</p>
                  </div>
                </div>
              </PixelCard>
            </Link>
            
            <Link to={ROUTES.MY_POLICY} className="block">
              <PixelCard variant="blue" className="p-8 hover:bg-slate-800/50 transition-colors h-full">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-green-400">{activePolicies}</p>
                    <p className="text-sm text-text-on-dark-secondary">Active Policies</p>
                  </div>
                </div>
              </PixelCard>
            </Link>
            
            <PixelCard variant="blue" className="p-8 h-full">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-yellow-400 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{openClaims}</p>
                  <p className="text-sm text-text-on-dark-secondary">Open Claims</p>
                </div>
              </div>
            </PixelCard>
          </div>

          {/* AI Risk Insights */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PixelCard variant="blue" className="p-8">
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">AI Risk Insights</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-text-on-dark-primary font-medium">Low Risk Profile</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Driving Score</span>
                    <span className="text-green-400 font-semibold">92/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Claim History</span>
                    <span className="text-green-400 font-semibold">Excellent</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-on-dark-secondary">Fraud Risk</span>
                    <span className="text-green-400 font-semibold">Very Low</span>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 mt-6">
                  <div className="text-green-400 text-sm font-medium flex items-center mb-3">
                    💡 AI Tip
                  </div>
                  <div className="text-text-on-dark-secondary text-sm leading-relaxed">
                    Your excellent driving record qualifies you for a 15% discount on renewal!
                  </div>
                </div>
              </div>
            </PixelCard>

            {/* Quick Actions */}
            <PixelCard variant="blue" className="p-8">
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link to={ROUTES.NEW_CLAIM} className="block">
                  <Button variant="primary" className="w-full justify-center">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Start New Claim
                  </Button>
                </Link>
                <Link to={ROUTES.CLAIMS} className="block">
                  <Button variant="secondary" className="w-full justify-center">
                    <FileTextIcon className="h-5 w-5 mr-2" />
                    View All Claims
                  </Button>
                </Link>
                <Link to="/test-certificate" className="block">
                  <Button variant="secondary" className="w-full justify-center bg-green-700/30 text-green-300 hover:bg-green-700/50 border-green-500/50">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Download Certificate
                  </Button>
                </Link>
                <Link to={ROUTES.MY_POLICY} className="block">
                  <Button variant="secondary" className="w-full justify-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    View Policy Details
                  </Button>
                </Link>
              </div>
            </PixelCard>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 mb-12">
            <PixelCard variant="blue" className="p-8">
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-on-dark-primary">Claim #CLM-2024-001 approved</p>
                    <p className="text-xs text-text-on-dark-secondary">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg">
                  <FileTextIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-on-dark-primary">Document uploaded for Claim #CLM-2024-002</p>
                    <p className="text-xs text-text-on-dark-secondary">5 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-on-dark-primary">Policy renewed successfully</p>
                    <p className="text-xs text-text-on-dark-secondary">1 week ago</p>
                  </div>
                </div>
              </div>
            </PixelCard>
          </div>
        </div>
      </div>
    );
  }

  // Insurer/Admin Dashboard (Classic View)
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <PageHeader 
            title="Insurance Management Dashboard" 
            subtitle="Real-time analytics and actionable insights for claim management"
          />
          <div className="flex space-x-3">
            <Button 
              onClick={() => navigate(ROUTES.CLAIMS)}
              variant="primary"
              size="sm"
              leftIcon={<AlertTriangleIcon className="h-4 w-4" />}
            >
              Urgent Claims ({urgentTasks})
            </Button>
          </div>
        </div>
        
        {/* Key Performance Metrics with Material Design Styling */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PixelCard variant="blue" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <FileTextIcon className="h-8 w-8 text-blue-400 flex-shrink-0" />
                <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                  +12% ↑
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-text-on-dark-primary">{totalClaims}</p>
                <p className="text-sm text-text-on-dark-secondary">Total Claims</p>
                <p className="text-xs text-green-400 mt-1">↑ 13 new this week</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <AlertTriangleIcon className="h-8 w-8 text-yellow-400 flex-shrink-0" />
                <span className="text-xs font-medium px-2 py-1 bg-red-900/30 text-red-300 rounded-full">
                  +8% ↑
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-yellow-400">{openClaims}</p>
                <p className="text-sm text-text-on-dark-secondary">Needs Attention</p>
                <p className="text-xs text-yellow-400 mt-1">{pendingApprovals} pending approval</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <UsersIcon className="h-8 w-8 text-green-400 flex-shrink-0" />
                <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                  +15% ↑
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-green-400">{totalUsers.toLocaleString()}</p>
                <p className="text-sm text-text-on-dark-secondary">Active Users</p>
                <p className="text-xs text-green-400 mt-1">↑ 187 new this month</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <ChartBarIcon className="h-8 w-8 text-purple-400 flex-shrink-0" />
                <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                  +23% ↑
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-purple-400">R{(monthlyRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-text-on-dark-secondary">Monthly Revenue</p>
                <p className="text-xs text-purple-400 mt-1">↑ R0.4M vs last month</p>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Actionable Insights Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PixelCard variant="blue" className="p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-900/30 rounded-lg mr-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-on-dark-primary">{fraudAlerts}</p>
                  <p className="text-sm text-text-on-dark-secondary">High Risk Claims</p>
                </div>
              </div>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => navigate('/claims?filter=high-risk')}
              >
                Review
              </Button>
            </div>
            <p className="text-xs text-red-300">Requires immediate investigation</p>
          </PixelCard>

          <PixelCard variant="blue" className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900/30 rounded-lg mr-3">
                  <ClockIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-on-dark-primary">{pendingApprovals}</p>
                  <p className="text-sm text-text-on-dark-secondary">Pending Approvals</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/claims?status=pending')}
              >
                Process
              </Button>
            </div>
            <p className="text-xs text-yellow-300">Average wait: 2.3 days</p>
          </PixelCard>

          <PixelCard variant="blue" className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-900/30 rounded-lg mr-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-on-dark-primary">94.2%</p>
                  <p className="text-sm text-text-on-dark-secondary">Approval Rate</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(ROUTES.ANALYTICS)}
                className="border-green-400 text-green-300"
              >
                Details
              </Button>
            </div>
            <p className="text-xs text-green-300">↑ 2.1% vs last month</p>
          </PixelCard>
        </div>

        {/* Quick Actions & Performance Dashboard */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <PixelCard variant="blue" className="p-6">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6 flex items-center">
              <ZapIcon className="h-5 w-5 text-yellow-400 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                leftIcon={<EyeIcon className="h-4 w-4" />}
                onClick={() => navigate('/claims?filter=urgent')}
              >
                Review Urgent Claims ({urgentTasks})
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-yellow-400 text-yellow-300 hover:bg-yellow-900/20"
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                onClick={() => navigate('/claims?status=pending')}
              >
                Process Approvals ({pendingApprovals})
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-green-400 text-green-300 hover:bg-green-900/20"
                leftIcon={<DownloadIcon className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.REPORTS)}
              >
                Generate Reports
              </Button>
            </div>
          </PixelCard>

          {/* Performance Metrics */}
          <PixelCard variant="blue" className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6 flex items-center">
              <TrendingUpIcon className="h-5 w-5 text-green-400 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-on-dark-secondary">Processing Speed</p>
                    <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                      ↓ 18%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-400">3.2 days</p>
                  <p className="text-xs text-green-400">Average resolution time</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-on-dark-secondary">Customer Satisfaction</p>
                    <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                      ↑ 5%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-400">4.8/5</p>
                  <p className="text-xs text-blue-400">Based on 1,247 reviews</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-on-dark-secondary">Fraud Detection</p>
                    <span className="text-xs font-medium px-2 py-1 bg-red-900/30 text-red-300 rounded-full">
                      ↑ 12%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-red-400">2.8%</p>
                  <p className="text-xs text-red-400">Claims flagged for review</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-on-dark-secondary">Cost Efficiency</p>
                    <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                      ↓ 8%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-purple-400">R187</p>
                  <p className="text-xs text-purple-400">Avg cost per claim</p>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Claims Trend</h3>
              <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-full">
                ↑ 12% vs last period
              </span>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimsByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="Submitted" fill="#3B82F6" name="Submitted" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Approved" fill="#10B981" name="Approved" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Rejected" fill="#EF4444" name="Rejected" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Risk Assessment</h3>
              <span className="text-xs font-medium px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-full">
                ↑ 3% risk level
              </span>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskScoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgRiskScore" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    name="Average Risk Score"
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>
        </div>

        {/* Bottom Actions & Summary */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PixelCard variant="blue" className="p-6">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-text-on-dark-primary">API Response Time</span>
                </div>
                <span className="text-green-400 font-semibold">142ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-text-on-dark-primary">Database Health</span>
                </div>
                <span className="text-green-400 font-semibold">Optimal</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-text-on-dark-primary">Cache Hit Rate</span>
                </div>
                <span className="text-yellow-400 font-semibold">87%</span>
              </div>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-6">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-on-dark-primary">15 claims approved by Sarah Johnson</p>
                  <p className="text-xs text-text-on-dark-secondary">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <AlertTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-on-dark-primary">High-risk claim flagged: DET-002</p>
                  <p className="text-xs text-text-on-dark-secondary">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-on-dark-primary">23 new user registrations</p>
                  <p className="text-xs text-text-on-dark-secondary">1 hour ago</p>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};