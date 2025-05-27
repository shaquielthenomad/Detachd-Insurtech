import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { EditIcon } from '../common/Icon';

// Assuming PolicyDetails and createMockPolicyDetails might be shareable
// For now, let's copy a simplified version or import if moved to a shared location.
// Ideally, createMockPolicyDetails and PolicyDetails interface should be in a shared file.

interface PolicyDetails {
  id: string;
  policyNumber: string;
  policyType: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled' | 'pending_update_review';
  coverageStartDate: string;
  coverageEndDate: string;
  premiumAmount: number;
  deductible: number;
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
  // Copied from PolicyDetailsPage.tsx for consistency, ideally import from types.ts
  coverageDetails?: {
    vehicleDamage?: number;
    thirdParty?: number;
    theft?: number;
    personalAccident?: number;
    medicalExpenses?: number;
    roadside?: boolean;
    rental?: boolean;
  };
  updatesPendingReview?: boolean; // New flag
  // Add other fields as necessary from the original PolicyDetails
}

// Simplified mock creator for EditPolicyPage context
// In a real app, this would fetch real data or use a shared mock
const createMockPolicyDetailsForEdit = (policyId: string, userName: string): PolicyDetails => {
  // This is a placeholder. In a real scenario, you would fetch existing policy data.
  // For now, let's assume a base structure. It should ideally load from localStorage if previously saved.
  let allPolicies: PolicyDetails[] = [];
  try {
    const storedPolicies = localStorage.getItem('userPolicies');
    if (storedPolicies) {
      allPolicies = JSON.parse(storedPolicies);
    }
  } catch (e) { console.error("Failed to parse userPolicies from localStorage", e); }

  const existingPolicy = allPolicies.find(p => p.id === policyId);
  if (existingPolicy) {
    if (!existingPolicy.coverageDetails) {
      existingPolicy.coverageDetails = {
        roadside: false,
        rental: false,
      };
    }
    return existingPolicy;
  }

  // Fallback to a default mock if not found (should ideally not happen if page is navigated to correctly)
  return {
    id: policyId,
    policyNumber: `DET-POL-${policyId.padStart(3, '0')}`,
    policyType: 'Comprehensive Motor Insurance',
    status: 'active',
    coverageStartDate: '2024-01-01',
    coverageEndDate: '2025-01-01',
    premiumAmount: 1200,
    deductible: 500,
    policyholder: {
      name: userName || 'Mock User',
      address: '123 Test St, Testville',
      phone: '0820000000',
      email: 'test@example.com',
    },
    vehicle: {
      make: 'TestMake',
      model: 'TestModel',
      year: 2022,
      vin: `VIN${policyId}`,
      licensePlate: `TEST ${policyId} GP`,
    },
    coverageDetails: {
      vehicleDamage: 500000,
      thirdParty: 2000000,
      theft: 50000,
      personalAccident: existingPolicy.coverageDetails?.personalAccident || 0,
      medicalExpenses: existingPolicy.coverageDetails?.medicalExpenses || 0,
      roadside: existingPolicy.coverageDetails?.roadside || false,
      rental: existingPolicy.coverageDetails?.rental || false,
    },
    updatesPendingReview: false
  };
};


export const EditPolicyPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [policy, setPolicy] = useState<PolicyDetails | null>(null);
  const [formData, setFormData] = useState<Partial<PolicyDetails['policyholder'] & { vehicleLicensePlate?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!policyId) {
        navigate(ROUTES.MY_POLICY); // Or some error page
        return;
      }
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY / 2));
      const fetchedPolicy = createMockPolicyDetailsForEdit(policyId, user?.name || 'Default User');
      setPolicy(fetchedPolicy);
      setFormData({
        address: fetchedPolicy.policyholder.address,
        phone: fetchedPolicy.policyholder.phone,
        email: fetchedPolicy.policyholder.email,
        vehicleLicensePlate: fetchedPolicy.vehicle?.licensePlate,
      });
      setIsLoading(false);
    };
    fetchPolicy();
  }, [policyId, user?.name, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForReview = async () => {
    if (!policy || !policyId) return;
    setIsSubmitting(true);

    const updatedPolicy: PolicyDetails = {
      ...policy,
      policyholder: {
        ...policy.policyholder,
        address: formData.address || policy.policyholder.address,
        phone: formData.phone || policy.policyholder.phone,
        email: formData.email || policy.policyholder.email,
      },
      vehicle: policy.vehicle ? {
        ...policy.vehicle,
        licensePlate: formData.vehicleLicensePlate || policy.vehicle.licensePlate,
      } : undefined,
      updatesPendingReview: true, // Flag for review
      status: 'pending_update_review', // Also update status
    };

    try {
      let allPolicies: PolicyDetails[] = [];
      const storedPolicies = localStorage.getItem('userPolicies');
      if (storedPolicies) {
        allPolicies = JSON.parse(storedPolicies);
      }
      const policyIndex = allPolicies.findIndex(p => p.id === policyId);
      if (policyIndex > -1) {
        allPolicies[policyIndex] = updatedPolicy;
      } else {
        allPolicies.push(updatedPolicy); // Should not happen if fetched correctly
      }
      localStorage.setItem('userPolicies', JSON.stringify(allPolicies));
      
      // Optionally, create a separate entry for insurer review queue
      const pendingReviews = JSON.parse(localStorage.getItem('pendingPolicyUpdates') || '[]');
      pendingReviews.push({ policyId: updatedPolicy.id, policyNumber: updatedPolicy.policyNumber, requestedChanges: formData, submittedAt: new Date().toISOString() });
      localStorage.setItem('pendingPolicyUpdates', JSON.stringify(pendingReviews));

    } catch (e) {
      console.error("Error saving updated policy to localStorage:", e);
      // Handle error (e.g., show a notification)
    }
    
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY)); // Simulate API call
    setIsSubmitting(false);
    navigate(ROUTES.POLICY_DETAILS.replace(':policyId', policyId));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading policy for editing..." />;
  }

  if (!policy) {
    return (
      <div>
        <PageHeader title="Policy Not Found" showBackButton backButtonPath={ROUTES.MY_POLICY} />
        <PixelCard variant="blue"><p className="text-center">Could not load policy data to edit.</p></PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={`Edit Policy #${policy.policyNumber}`}
        subtitle="Submit changes for review"
        showBackButton 
        backButtonPath={ROUTES.POLICY_DETAILS.replace(':policyId', policy.id)}
      />
      <PixelCard variant="blue">
        <div className="space-y-6 p-2">
          <h3 className="text-xl font-semibold text-text-on-dark-primary mb-4">Policyholder Details</h3>
          <Input 
            label="Address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          <Input 
            label="Phone Number"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          <Input 
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />

          {policy.vehicle && (
            <>
              <h3 className="text-xl font-semibold text-text-on-dark-primary mt-6 mb-4">Vehicle Details</h3>
              <Input 
                label="License Plate"
                name="vehicleLicensePlate"
                value={formData.vehicleLicensePlate || ''}
                onChange={handleChange}
                containerClassName="[&>label]:text-text-on-dark-secondary"
              />
            </>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              onClick={handleSubmitForReview} 
              isLoading={isSubmitting} 
              leftIcon={<EditIcon className="h-4 w-4"/>}
            >
              Submit Changes for Review
            </Button>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default EditPolicyPage; 