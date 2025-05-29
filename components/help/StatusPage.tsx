import React from 'react';
import PixelCard from '../common/PixelCard';

export const StatusPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-light">System Status</h1>
        <p className="text-text-dim mt-2">Current operational status of our services</p>
      </div>

      <PixelCard variant="green" title="All Systems Operational">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Core Services</span>
            <span className="text-green-600 font-semibold">✓ Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Claims Processing</span>
            <span className="text-green-600 font-semibold">✓ Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">User Authentication</span>
            <span className="text-green-600 font-semibold">✓ Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Document Upload</span>
            <span className="text-green-600 font-semibold">✓ Operational</span>
          </div>
        </div>
      </PixelCard>

      <PixelCard variant="blue" title="Recent Updates">
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-medium">May 28, 2024 - 10:30 AM</p>
            <p className="text-text-dim">Deployed improvements to claim verification system</p>
          </div>
          <div className="text-sm">
            <p className="font-medium">May 27, 2024 - 3:15 PM</p>
            <p className="text-text-dim">Enhanced security measures for document uploads</p>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}; 