import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { 
  ShieldCheckIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  FileTextIcon,
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  EditIcon,
  DownloadIcon
} from '../common/Icon';

interface PolicyDetails {
  id: string;
  policyNumber: string;
  policyType: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  coverageStartDate: string;
  coverageEndDate: string;
  premiumAmount: number;
  deductible: number;
  insurer: string;
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  policyholder: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
  };
  coverageDetails: {
    vehicleDamage?: number;
    thirdParty?: number;
    theft?: number;
    personalAccident?: number;
    medicalExpenses?: number;
    roadside?: boolean;
    rental?: boolean;
  };
  documents: {
    policyDocument: string;
    scheduleOfAssets: string;
    termsAndConditions: string;
  };
}

const createMockPolicyDetails = (policyId: string, userName: string): PolicyDetails => {
  const policyData: { [key: string]: Partial<PolicyDetails> } = {
    '1': {
      id: '1',
      policyNumber: 'DET-POL-001',
      policyType: 'Comprehensive Motor Insurance',
      status: 'active',
      coverageStartDate: '2024-01-15',
      coverageEndDate: '2025-01-14',
      premiumAmount: 1250.00,
      deductible: 5000,
      insurer: 'Santam Insurance',
      agent: {
        name: 'Sarah Johnson',
        phone: '+27 11 123 4567',
        email: 'sarah.johnson@santam.co.za'
      },
      vehicle: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        vin: 'ABC123XYZ789',
        licensePlate: 'CA 123 GP'
      },
      coverageDetails: {
        vehicleDamage: 500000,
        thirdParty: 2000000,
        theft: 500000,
        personalAccident: 100000,
        medicalExpenses: 50000,
        roadside: true,
        rental: true
      }
    },
    '2': {
      id: '2',
      policyNumber: 'DET-POL-002',
      policyType: 'Third Party Only',
      status: 'expired',
      coverageStartDate: '2023-06-01',
      coverageEndDate: '2024-05-31',
      premiumAmount: 450.00,
      deductible: 2000,
      insurer: 'Discovery Insure',
      agent: {
        name: 'Michael Chen',
        phone: '+27 21 987 6543',
        email: 'michael.chen@discovery.co.za'
      },
      vehicle: {
        make: 'Volkswagen',
        model: 'Polo',
        year: 2020,
        vin: 'DEF456UVW012',
        licensePlate: 'CA 456 WC'
      },
      coverageDetails: {
        thirdParty: 1000000,
        roadside: false,
        rental: false
      }
    }
  };

  const baseData = policyData[policyId] || policyData['1'];
  
  return {
    policyholder: {
      name: 'Jacob Doe',
      address: '145 Long Street, Cape Town, 8001',
      phone: '084 497 6894',
      email: 'j.doe@gmail.com'
    },
    documents: {
      policyDocument: '#',
      scheduleOfAssets: '#',
      termsAndConditions: '#'
    },
    ...baseData
  } as PolicyDetails;
};

export const PolicyDetailsPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<PolicyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (policyId) {
        const policyDetails = createMockPolicyDetails(policyId, user?.name || 'John Smith');
        setPolicy(policyDetails);
      } else {
        setPolicy(null);
      }
      setIsLoading(false);
    };

    fetchPolicyDetails();
  }, [policyId, user?.name]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: PolicyDetails['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-300 bg-green-700/30 border-green-500';
      case 'expired':
        return 'text-red-300 bg-red-700/30 border-red-500';
      case 'pending':
        return 'text-yellow-300 bg-yellow-700/30 border-yellow-500';
      case 'cancelled':
        return 'text-gray-300 bg-gray-700/30 border-gray-500';
      default:
        return 'text-slate-300 bg-slate-700/30 border-slate-500';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={`Loading policy ${policyId} details...`} />;
  }

  if (!policy) {
    return (
      <div>
        <PageHeader title="Policy Not Found" showBackButton backButtonPath={ROUTES.MY_POLICY} />
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary">
            The policy you are looking for could not be found.
          </p>
          <div className="mt-4 text-center">
            <Button variant="primary" onClick={() => navigate(ROUTES.MY_POLICY)}>
              Back to Policies
            </Button>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={`Policy #${policy.policyNumber}`}
        subtitle={policy.policyType}
        showBackButton 
        backButtonPath={ROUTES.MY_POLICY}
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              leftIcon={<EditIcon className="h-4 w-4" />}
              onClick={() => navigate(`${ROUTES.MY_POLICY}/${policy.id}/edit`)}
            >
              Edit Policy
            </Button>
            <Button 
              variant="primary" 
              leftIcon={<DownloadIcon className="h-4 w-4" />}
              onClick={() => window.open(policy.documents.policyDocument, '_blank')}
            >
              Download PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policy Overview */}
          <PixelCard 
            variant="blue" 
            title="Policy Overview" 
            icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                icon={<ShieldCheckIcon className="h-4 w-4 text-blue-400" />}
                label="Policy Type" 
                value={policy.policyType} 
              />
              <DetailItem 
                icon={<CalendarIcon className="h-4 w-4 text-blue-400" />}
                label="Status" 
                value={
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(policy.status)}`}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </span>
                } 
              />
              <DetailItem 
                icon={<CalendarIcon className="h-4 w-4 text-blue-400" />}
                label="Coverage Period" 
                value={`${formatDate(policy.coverageStartDate)} - ${formatDate(policy.coverageEndDate)}`} 
              />
              <DetailItem 
                icon={<CreditCardIcon className="h-4 w-4 text-blue-400" />}
                label="Monthly Premium" 
                value={formatCurrency(policy.premiumAmount)} 
              />
              <DetailItem 
                icon={<CreditCardIcon className="h-4 w-4 text-blue-400" />}
                label="Deductible" 
                value={formatCurrency(policy.deductible)} 
              />
              <DetailItem 
                icon={<ShieldCheckIcon className="h-4 w-4 text-blue-400" />}
                label="Insurer" 
                value={policy.insurer} 
              />
            </div>
          </PixelCard>

          {/* Vehicle Information */}
          {policy.vehicle && (
            <PixelCard 
              variant="blue" 
              title="Vehicle Information" 
              icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Make & Model" value={`${policy.vehicle.make} ${policy.vehicle.model}`} />
                <DetailItem label="Year" value={policy.vehicle.year.toString()} />
                <DetailItem label="VIN" value={policy.vehicle.vin} />
                <DetailItem label="License Plate" value={policy.vehicle.licensePlate} />
              </div>
            </PixelCard>
          )}

          {/* Coverage Details */}
          <PixelCard 
            variant="blue" 
            title="Coverage Details" 
            icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policy.coverageDetails.vehicleDamage && (
                <DetailItem 
                  label="Vehicle Damage" 
                  value={formatCurrency(policy.coverageDetails.vehicleDamage)} 
                />
              )}
              {policy.coverageDetails.thirdParty && (
                <DetailItem 
                  label="Third Party Liability" 
                  value={formatCurrency(policy.coverageDetails.thirdParty)} 
                />
              )}
              {policy.coverageDetails.theft && (
                <DetailItem 
                  label="Theft Cover" 
                  value={formatCurrency(policy.coverageDetails.theft)} 
                />
              )}
              {policy.coverageDetails.personalAccident && (
                <DetailItem 
                  label="Personal Accident" 
                  value={formatCurrency(policy.coverageDetails.personalAccident)} 
                />
              )}
              {policy.coverageDetails.medicalExpenses && (
                <DetailItem 
                  label="Medical Expenses" 
                  value={formatCurrency(policy.coverageDetails.medicalExpenses)} 
                />
              )}
              <DetailItem 
                label="Roadside Assistance" 
                value={policy.coverageDetails.roadside ? 'Included' : 'Not Included'} 
              />
              <DetailItem 
                label="Rental Car" 
                value={policy.coverageDetails.rental ? 'Included' : 'Not Included'} 
              />
            </div>
          </PixelCard>

          {/* Documents */}
          <PixelCard 
            variant="blue" 
            title="Policy Documents" 
            icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="space-y-3">
              <DocumentLink 
                name="Policy Document" 
                url={policy.documents.policyDocument} 
              />
              <DocumentLink 
                name="Schedule of Assets" 
                url={policy.documents.scheduleOfAssets} 
              />
              <DocumentLink 
                name="Terms & Conditions" 
                url={policy.documents.termsAndConditions} 
              />
            </div>
          </PixelCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Policyholder Information */}
          <PixelCard 
            variant="blue" 
            title="Policyholder" 
            icon={<UserCircleIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="space-y-3">
              <DetailItem 
                icon={<UserCircleIcon className="h-4 w-4 text-blue-400" />}
                label="Name" 
                value={policy.policyholder.name} 
              />
              <DetailItem 
                icon={<MapPinIcon className="h-4 w-4 text-blue-400" />}
                label="Address" 
                value={policy.policyholder.address} 
              />
              <DetailItem 
                icon={<PhoneIcon className="h-4 w-4 text-blue-400" />}
                label="Phone" 
                value={policy.policyholder.phone} 
              />
              <DetailItem 
                icon={<MailIcon className="h-4 w-4 text-blue-400" />}
                label="Email" 
                value={policy.policyholder.email} 
              />
            </div>
          </PixelCard>

          {/* Agent Information */}
          <PixelCard 
            variant="blue" 
            title="Insurance Agent" 
            icon={<UserCircleIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="space-y-3">
              <DetailItem 
                icon={<UserCircleIcon className="h-4 w-4 text-blue-400" />}
                label="Agent" 
                value={policy.agent.name} 
              />
              <DetailItem 
                icon={<PhoneIcon className="h-4 w-4 text-blue-400" />}
                label="Phone" 
                value={policy.agent.phone} 
              />
              <DetailItem 
                icon={<MailIcon className="h-4 w-4 text-blue-400" />}
                label="Email" 
                value={policy.agent.email} 
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Button 
                variant="outline" 
                className="w-full border-blue-400 text-blue-300 hover:bg-blue-700/30"
                onClick={() => window.open(`mailto:${policy.agent.email}`, '_blank')}
              >
                Contact Agent
              </Button>
            </div>
          </PixelCard>

          {/* Quick Actions */}
          <PixelCard variant="blue" title="Quick Actions">
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate(ROUTES.NEW_CLAIM)}
              >
                File a Claim
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-blue-400 text-blue-300 hover:bg-blue-700/30"
                onClick={() => navigate(`${ROUTES.MY_POLICY}/${policy.id}/edit`)}
              >
                Update Policy
              </Button>
              {policy.status === 'expired' && (
                <Button 
                  variant="outline" 
                  className="w-full border-green-400 text-green-300 hover:bg-green-700/30"
                  onClick={() => navigate(ROUTES.NEW_POLICY)}
                >
                  Renew Policy
                </Button>
              )}
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-2">
    {icon}
    <div className="min-w-0 flex-1">
      <dt className="text-sm font-medium text-text-on-dark-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-text-on-dark-primary">{value}</dd>
    </div>
  </div>
);

const DocumentLink: React.FC<{
  name: string;
  url: string;
}> = ({ name, url }) => (
  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
    <div className="flex items-center space-x-3">
      <FileTextIcon className="h-5 w-5 text-blue-400" />
      <span className="text-sm text-text-on-dark-primary">{name}</span>
    </div>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => window.open(url, '_blank')}
    >
      <DownloadIcon className="h-4 w-4" />
    </Button>
  </div>
);

export default PolicyDetailsPage; 