import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { FileTextIcon, ShieldCheckIcon } from '../common/Icon'; 

interface PolicyDetails {
  policyNumber: string;
  policyType: string;
  coverageStartDate: string;
  coverageEndDate: string;
  premiumAmount: number;
  deductible: number;
  insuredItems?: string[];
  coverageDetailsLink?: string;
}

const mockPolicyData: PolicyDetails = {
  policyNumber: "POL-123XYZ789",
  policyType: "Comprehensive Auto Insurance",
  coverageStartDate: "2024-01-01",
  coverageEndDate: "2025-01-01",
  premiumAmount: 120.50,
  deductible: 500,
  insuredItems: ["2023 Honda Civic - VIN: ABC123XYZ789"],
  coverageDetailsLink: "#"
};

export const MyPolicyPage: React.FC = () => {
  const { user } = useAuth();
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (user) {
        setPolicyDetails(mockPolicyData);
      }
      setIsLoading(false);
    };
    fetchPolicy();
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner message="Loading your policy details..." />;
  }

  if (!policyDetails) {
    return (
      <div>
        <PageHeader title="My Policy" />
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary">
            We could not find any active policy details for your account. 
            Please contact support if you believe this is an error.
          </p>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Policy Details" subtitle={`Policyholder: ${user?.name || 'N/A'}`} />
      
      <PixelCard 
        variant="blue" 
        icon={<ShieldCheckIcon className="h-6 w-6 text-blue-400" />} 
        title={`Policy #${policyDetails.policyNumber}`}
        contentClassName="text-text-on-dark-primary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <DetailItem label="Policy Type" value={policyDetails.policyType} />
          <DetailItem 
            label="Status" 
            value={new Date(policyDetails.coverageEndDate) > new Date() ? 'Active' : 'Expired'} 
            valueClassName={new Date(policyDetails.coverageEndDate) > new Date() ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'} 
          />
          <DetailItem label="Coverage Start Date" value={new Date(policyDetails.coverageStartDate).toLocaleDateString()} />
          <DetailItem label="Coverage End Date" value={new Date(policyDetails.coverageEndDate).toLocaleDateString()} />
          <DetailItem label="Premium" value={`$${policyDetails.premiumAmount.toFixed(2)} / month`} />
          <DetailItem label="Deductible" value={`$${policyDetails.deductible.toFixed(2)}`} />
          
          {policyDetails.insuredItems && policyDetails.insuredItems.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="font-medium text-text-on-dark-primary mb-1">Insured Item(s):</h4>
              <ul className="list-disc list-inside text-text-on-dark-secondary space-y-1">
                {policyDetails.insuredItems.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
        {policyDetails.coverageDetailsLink && (
            <div className="mt-6 border-t border-slate-700 pt-4">
                <a 
                    href={policyDetails.coverageDetailsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 font-medium flex items-center"
                >
                    <FileTextIcon className="h-5 w-5 mr-2"/> View Full Policy Document (PDF)
                </a>
            </div>
        )}
      </PixelCard>
    </div>
  );
};

interface DetailItemProps {
    label: string;
    value: string | React.ReactNode;
    valueClassName?: string;
}
const DetailItem: React.FC<DetailItemProps> = ({label, value, valueClassName}) => (
    <div>
        <dt className="font-medium text-text-on-dark-secondary">{label}</dt>
        <dd className={`mt-1 text-text-on-dark-primary ${valueClassName || ''}`}>{value}</dd>
    </div>
);

export default MyPolicyPage;