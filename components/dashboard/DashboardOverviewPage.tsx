import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { FileTextIcon, CheckCircleIcon, PlusCircleIcon, AlertTriangleIcon, ShieldCheckIcon, BellIcon, UsersIcon, ChartBarIcon } from '../common/Icon';
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
            
            <PixelCard variant="gray" className="p-4">
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

  // Insurer/Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <PageHeader 
          title="Insurance Dashboard" 
          subtitle="Comprehensive overview of claims, users, and system performance"
        />
        
        {/* Top Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <FileTextIcon className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-text-on-dark-primary">{totalClaims}</p>
                <p className="text-sm text-text-on-dark-secondary">Total Claims</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-400">{totalUsers}</p>
                <p className="text-sm text-text-on-dark-secondary">Active Users</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-8 w-8 text-red-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-red-400">{urgentTasks}</p>
                <p className="text-sm text-text-on-dark-secondary">Urgent Tasks</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-purple-400">R{(monthlyRevenue/1000000).toFixed(1)}M</p>
                <p className="text-sm text-text-on-dark-secondary">Monthly Revenue</p>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claims by Month Chart */}
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Claims Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimsByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Submitted" fill="#3b82f6" />
                  <Bar dataKey="Approved" fill="#10b981" />
                  <Bar dataKey="Rejected" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>

          {/* Claim Types Distribution */}
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Claim Types Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimTypesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {claimTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>
        </div>

        {/* Action Items */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={ROUTES.TASKS_OVERVIEW}>
            <PixelCard variant="blue" className="p-8 hover:bg-slate-800/50 transition-colors h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-400">{urgentTasks}</p>
                  <p className="text-sm text-text-on-dark-secondary">Urgent Tasks</p>
                </div>
                <AlertTriangleIcon className="h-8 w-8 text-red-400 flex-shrink-0" />
              </div>
            </PixelCard>
          </Link>
          
          <PixelCard variant="blue" className="p-8 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-400">{pendingApprovals}</p>
                <p className="text-sm text-text-on-dark-secondary">Pending Approvals</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-yellow-400 flex-shrink-0" />
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-400">{fraudAlerts}</p>
                <p className="text-sm text-text-on-dark-secondary">Fraud Alerts</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-orange-400 flex-shrink-0" />
            </div>
          </PixelCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 mb-12">
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to={ROUTES.REPORTS}>
                <Button variant="secondary" className="w-full justify-center h-full">
                  <ChartBarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  Generate Reports
                </Button>
              </Link>
              <Link to={ROUTES.ANALYTICS}>
                <Button variant="secondary" className="w-full justify-center h-full">
                  <ChartBarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  View Analytics
                </Button>
              </Link>
              <Link to={ROUTES.TEAM}>
                <Button variant="secondary" className="w-full justify-center h-full">
                  <UsersIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  Manage Team
                </Button>
              </Link>
              <Link to={ROUTES.SETTINGS}>
                <Button variant="secondary" className="w-full justify-center h-full">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Button>
              </Link>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};