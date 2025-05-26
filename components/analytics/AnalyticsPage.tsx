import React from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fraudTrendData = [
  { month: 'Jan', fraudulentClaims: 5, trend: 0.02 },
  { month: 'Feb', fraudulentClaims: 7, trend: 0.03 },
  { month: 'Mar', fraudulentClaims: 6, trend: 0.025 },
  { month: 'Apr', fraudulentClaims: 9, trend: 0.04 },
  { month: 'May', fraudulentClaims: 8, trend: 0.035 },
  { month: 'Jun', fraudulentClaims: 11, trend: 0.05 },
  { month: 'Jul', fraudulentClaims: 10, trend: 0.045 },
];

const policyholderBehaviorData = {
  verificationRate: 92,
  averageResponseTime: 2, 
};

const claimProcessingData = [
  { name: 'Automated Approvals', value: 65 },
  { name: 'Manual Reviews', value: 35 },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']; // Blue, Green, Amber, Red

const chartTextProps = {
    stroke: '#94a3b8', // text-on-dark-secondary
    fill: '#94a3b8',
    fontSize: 12,
};
const legendProps = {
    wrapperStyle: { color: '#cbd5e1', fontSize: '12px' } // text-on-dark-primary lighter
};
const tooltipProps = {
    wrapperClassName: "!bg-slate-700/80 !border-slate-600 !rounded-md !shadow-lg",
    contentStyle: { backgroundColor: 'transparent', border: 'none' },
    itemStyle: { color: '#e0e7ff' }, // text-on-dark-primary
    labelStyle: { color: '#cbd5e1' } // Lighter gray
};


export const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Analytics Overview" subtitle="Key insights into claim processing and fraud trends." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PixelCard variant="blue" title="Fraud Trends Over Time" contentClassName="text-text-on-dark-secondary">
          <p className="text-sm mb-1">Fraudulent Claims Trend: <span className="font-semibold text-blue-300">15% Up YTD</span></p>
          <p className="text-sm mb-4">Last 12 Months Change: <span className="font-semibold text-red-400">+5% Increase</span></p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fraudTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
              <XAxis dataKey="month" {...chartTextProps} />
              <YAxis yAxisId="left" {...chartTextProps} />
              <YAxis yAxisId="right" orientation="right" {...chartTextProps} />
              <Tooltip {...tooltipProps} formatter={(value: number, name: string) => name === 'trend' ? `${(Number(value) * 100).toFixed(1)}%` : value} />
              <Legend {...legendProps}/>
              <Line yAxisId="left" type="monotone" dataKey="fraudulentClaims" stroke="#ef4444" activeDot={{ r: 8 }} name="Fraudulent Claims" />
              <Line yAxisId="right" type="monotone" dataKey="trend" stroke="#60a5fa" name="Fraud Rate Trend" />
            </LineChart>
          </ResponsiveContainer>
        </PixelCard>

        <PixelCard variant="blue" title="Policyholder Behavior" contentClassName="text-text-on-dark-secondary">
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-lg font-medium text-text-on-dark-primary">Verification Rate</h4>
              <p className="text-3xl font-bold text-green-400">{policyholderBehaviorData.verificationRate}%</p>
              <p className="text-sm">Percentage of policyholders completing identity verification.</p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-text-on-dark-primary">Average Response Time</h4>
              <p className="text-3xl font-bold text-blue-300">{policyholderBehaviorData.averageResponseTime} hours</p>
              <p className="text-sm">Average time taken by policyholders to respond to information requests.</p>
            </div>
          </div>
        </PixelCard>

        <PixelCard variant="blue" title="Claim Processing Efficiency" className="lg:col-span-2" contentClassName="text-text-on-dark-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-lg font-medium text-text-on-dark-primary mb-2">Processing Breakdown</h4>
              <p className="text-sm mb-4">
                Current split between automated and manual claim processing steps.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Automated Approvals:</span>
                    <span className="font-semibold text-text-on-dark-primary">{claimProcessingData.find(d=>d.name === 'Automated Approvals')?.value}%</span>
                </div>
                 <div className="flex justify-between">
                    <span>Manual Reviews:</span>
                    <span className="font-semibold text-text-on-dark-primary">{claimProcessingData.find(d=>d.name === 'Manual Reviews')?.value}%</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={claimProcessingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  stroke="#1f2937" // Darker stroke for pie segments
                >
                  {claimProcessingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} />
                <Legend {...legendProps} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PixelCard>
      </div>
    </div>
  );
};