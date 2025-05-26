import React from 'react';
import { PageHeader } from './PageHeader';
import PixelCard from './PixelCard';
import { SettingsIcon } from './Icon';

export const PlaceholderPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Page Under Development" showBackButton />
      <PixelCard variant="blue">
        <div className="text-center py-12">
          <SettingsIcon className="mx-auto h-16 w-16 text-blue-400 mb-4" />
          <h2 className="text-2xl font-semibold text-text-on-dark-primary mb-2">
            Feature In Development
          </h2>
          <p className="text-text-on-dark-secondary mb-6">
            This feature is currently being built to provide you with the best possible experience.
            We're working hard to bring you advanced functionality.
          </p>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-text-on-dark-secondary">
              Expected completion: Q2 2024
            </p>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};