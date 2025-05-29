import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper, Chip, Avatar, IconButton, Divider } from '@mui/material';
import { TrendingUp, TrendingDown, MoreVert, Assessment, People, Security, AccountBalance } from '@mui/icons-material';
import { PageHeader } from '../common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Color palette for charts (adapted for Material Design)
const CHART_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  subtitle, 
  icon, 
  color = 'primary' 
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp sx={{ fontSize: 16 }} />;
    if (change < 0) return <TrendingDown sx={{ fontSize: 16 }} />;
    return null;
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  icon={getChangeIcon(change)}
                  label={`${change > 0 ? '+' : ''}${change}%`}
                  size="small"
                  color={getChangeColor(change)}
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ 
  title, 
  children, 
  action 
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {action && action}
      </Box>
      <Box height={300}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

export const MuiEnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalClaims: 0,
    openClaims: 0,
    closedClaims: 0,
    urgentTasks: 0,
    pendingApprovals: 0,
    fraudAlerts: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    claimsByMonth: [] as any[],
    riskScoreTrend: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';
      
      if (isInsurer) {
        setDashboardData({
          totalClaims: 125,
          openClaims: 30,
          closedClaims: 95,
          urgentTasks: 8,
          pendingApprovals: 15,
          fraudAlerts: 3,
          totalUsers: 1247,
          monthlyRevenue: 2150000,
          claimsByMonth: [
            { name: 'Jan', Submitted: 20, Approved: 15, Rejected: 2 },
            { name: 'Feb', Submitted: 25, Approved: 18, Rejected: 3 },
            { name: 'Mar', Submitted: 30, Approved: 22, Rejected: 4 },
            { name: 'Apr', Submitted: 28, Approved: 25, Rejected: 1 },
            { name: 'May', Submitted: 35, Approved: 30, Rejected: 2 },
            { name: 'Jun', Submitted: 40, Approved: 33, Rejected: 5 },
          ],
          riskScoreTrend: [
            { name: 'Week 1', avgRiskScore: 65 },
            { name: 'Week 2', avgRiskScore: 68 },
            { name: 'Week 3', avgRiskScore: 62 },
            { name: 'Week 4', avgRiskScore: 70 },
            { name: 'Week 5', avgRiskScore: 67 },
          ],
        });
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [user?.role]);

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';

  if (!isInsurer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Access Restricted</Typography>
        <Typography>This enhanced dashboard is only available for insurer administrators.</Typography>
      </Box>
    );
  }

  const claimTypesData = [
    { name: 'Auto Accident', value: 40, color: CHART_COLORS[0] },
    { name: 'Property Damage', value: 25, color: CHART_COLORS[1] },
    { name: 'Medical', value: 20, color: CHART_COLORS[2] },
    { name: 'Theft', value: 15, color: CHART_COLORS[3] },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <PageHeader 
        title="Enhanced Insurance Dashboard" 
        subtitle="Comprehensive overview with Material Design"
      />
      
      {/* Key Metrics */}
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Claims"
              value={dashboardData.totalClaims}
              change={12}
              subtitle="Active and closed"
              icon={<Assessment />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Open Claims"
              value={dashboardData.openClaims}
              change={-5}
              subtitle="Pending review"
              icon={<Security />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Users"
              value={`${(dashboardData.totalUsers / 1000).toFixed(1)}k`}
              change={25}
              subtitle="Registered users"
              icon={<People />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Monthly Revenue"
              value={`R${(dashboardData.monthlyRevenue / 1000000).toFixed(1)}M`}
              change={8}
              subtitle="South African Rand"
              icon={<AccountBalance />}
              color="info"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <ChartCard 
              title="Claims by Month"
              action={
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.claimsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Submitted" fill={CHART_COLORS[0]} name="Submitted" />
                  <Bar dataKey="Approved" fill={CHART_COLORS[1]} name="Approved" />
                  <Bar dataKey="Rejected" fill={CHART_COLORS[3]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <ChartCard title="Claim Types Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimTypesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {claimTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>

      {/* Risk Score Trend */}
      <Box mt={4}>
        <ChartCard title="Risk Score Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData.riskScoreTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgRiskScore" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={3}
                name="Average Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Activity Feed */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {[
                { action: 'New claim submitted', time: '2 minutes ago', type: 'info' },
                { action: 'Fraud alert triggered', time: '15 minutes ago', type: 'warning' },
                { action: 'Policy renewed', time: '1 hour ago', type: 'success' },
                { action: 'User registration', time: '2 hours ago', type: 'info' },
              ].map((activity, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Box display="flex" alignItems="center">
                    <Chip 
                      size="small" 
                      label={activity.type} 
                      color={activity.type as any}
                      sx={{ mr: 2, width: 80 }}
                    />
                    <Typography variant="body2">
                      {activity.action}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}; 