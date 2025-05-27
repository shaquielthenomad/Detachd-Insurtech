import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { ChartBarIcon, TrendingUpIcon, AlertTriangleIcon, ShieldCheckIcon } from '../common/Icon';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

interface AnalyticsData {
  claimsOverTime: { month: string; submitted: number; approved: number; rejected: number; }[];
  riskDistribution: { name: string; value: number; color: string; }[];
  fraudDetection: { week: string; flagged: number; genuine: number; }[];
  regionAnalysis: { region: string; claims: number; avgAmount: number; riskScore: number; }[];
  processingTimes: { stage: string; avgDays: number; targetDays: number; }[];
  userActivity: { hour: string; logins: number; claims: number; }[];
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData: AnalyticsData = {
        claimsOverTime: [
          { month: 'Jan', submitted: 145, approved: 123, rejected: 15 },
          { month: 'Feb', submitted: 167, approved: 142, rejected: 18 },
          { month: 'Mar', submitted: 189, approved: 165, rejected: 12 },
          { month: 'Apr', submitted: 201, approved: 178, rejected: 16 },
          { month: 'May', submitted: 223, approved: 198, rejected: 14 },
          { month: 'Jun', submitted: 198, approved: 175, rejected: 13 },
          { month: 'Jul', submitted: 234, approved: 208, rejected: 18 },
          { month: 'Aug', submitted: 256, approved: 229, rejected: 19 },
          { month: 'Sep', submitted: 243, approved: 218, rejected: 15 },
          { month: 'Oct', submitted: 267, approved: 241, rejected: 16 },
          { month: 'Nov', submitted: 289, approved: 261, rejected: 17 },
          { month: 'Dec', submitted: 312, approved: 284, rejected: 19 },
        ],
        riskDistribution: [
          { name: 'Low Risk (0-30)', value: 45, color: '#10b981' },
          { name: 'Medium Risk (31-70)', value: 35, color: '#f59e0b' },
          { name: 'High Risk (71-100)', value: 20, color: '#ef4444' },
        ],
        fraudDetection: [
          { week: 'Week 1', flagged: 8, genuine: 142 },
          { week: 'Week 2', flagged: 12, genuine: 156 },
          { week: 'Week 3', flagged: 6, genuine: 189 },
          { week: 'Week 4', flagged: 15, genuine: 167 },
          { week: 'Week 5', flagged: 9, genuine: 178 },
          { week: 'Week 6', flagged: 11, genuine: 145 },
        ],
        regionAnalysis: [
          { region: 'Western Cape', claims: 856, avgAmount: 24500, riskScore: 32 },
          { region: 'Gauteng', claims: 1247, avgAmount: 31200, riskScore: 38 },
          { region: 'KwaZulu-Natal', claims: 623, avgAmount: 19800, riskScore: 29 },
          { region: 'Eastern Cape', claims: 445, avgAmount: 18900, riskScore: 34 },
          { region: 'Free State', claims: 278, avgAmount: 16700, riskScore: 26 },
          { region: 'Mpumalanga', claims: 334, avgAmount: 21300, riskScore: 31 },
        ],
        processingTimes: [
          { stage: 'Initial Review', avgDays: 2.3, targetDays: 3 },
          { stage: 'Document Verification', avgDays: 4.1, targetDays: 5 },
          { stage: 'Risk Assessment', avgDays: 1.8, targetDays: 2 },
          { stage: 'Adjuster Review', avgDays: 6.2, targetDays: 7 },
          { stage: 'Final Approval', avgDays: 2.9, targetDays: 3 },
        ],
        userActivity: [
          { hour: '00:00', logins: 12, claims: 2 },
          { hour: '04:00', logins: 8, claims: 1 },
          { hour: '08:00', logins: 245, claims: 23 },
          { hour: '12:00', logins: 189, claims: 18 },
          { hour: '16:00', logins: 167, claims: 15 },
          { hour: '20:00', logins: 134, claims: 12 },
        ],
      };
      
      setData(mockData);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [selectedTimeRange]);

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics data..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">Failed to load analytics</h3>
        <p className="text-slate-400">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <PageHeader 
          title="Analytics Dashboard" 
          subtitle="Advanced insights and performance metrics"
          actions={
            <div className="flex items-center space-x-3">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          }
        />

        {/* Key Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-400">94.2%</p>
                <p className="text-sm text-text-on-dark-secondary">Approval Rate</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-400">4.2d</p>
                <p className="text-sm text-text-on-dark-secondary">Avg Processing</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-8 w-8 text-yellow-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-yellow-400">3.8%</p>
                <p className="text-sm text-text-on-dark-secondary">Fraud Detection</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-8">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-purple-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-purple-400">R2.8M</p>
                <p className="text-sm text-text-on-dark-secondary">Total Payouts</p>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Claims Trends */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Claims Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.claimsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="submitted" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="approved" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rejected" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Risk Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {data.riskDistribution.map((entry, index) => (
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

        {/* Fraud Detection */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Fraud Detection Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.fraudDetection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={3} />
                  <Line type="monotone" dataKey="genuine" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Processing Time Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.processingTimes} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="stage" type="category" stroke="#9ca3af" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgDays" fill="#3b82f6" />
                  <Bar dataKey="targetDays" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>
        </div>

        {/* Regional Analysis */}
        <div className="mt-8">
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Regional Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-text-on-dark-primary">Region</th>
                    <th className="text-right py-3 text-text-on-dark-primary">Claims</th>
                    <th className="text-right py-3 text-text-on-dark-primary">Avg Amount</th>
                    <th className="text-right py-3 text-text-on-dark-primary">Risk Score</th>
                    <th className="text-right py-3 text-text-on-dark-primary">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regionAnalysis.map((region, index) => (
                    <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-4 text-text-on-dark-primary font-medium">{region.region}</td>
                      <td className="py-4 text-right text-text-on-dark-secondary">{region.claims.toLocaleString()}</td>
                      <td className="py-4 text-right text-text-on-dark-secondary">R{region.avgAmount.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          region.riskScore < 30 ? 'bg-green-900/30 text-green-300' :
                          region.riskScore < 35 ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-red-900/30 text-red-300'
                        }`}>
                          {region.riskScore}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="w-16 bg-slate-700 rounded-full h-2 ml-auto">
                          <div 
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${Math.min((region.claims / 1500) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PixelCard>
        </div>

        {/* User Activity */}
        <div className="mt-8 mb-12">
          <PixelCard variant="blue" className="p-8">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-6">Daily Activity Patterns</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="logins" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="claims" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};