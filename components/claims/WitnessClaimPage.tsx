import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';

interface Claim {
  id: string;
  claimNumber: string;
  dateOfLoss: string;
  claimType: string;
  status: string;
  description?: string;
}

export const WitnessClaimPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWitnessClaims();
  }, []);

  const fetchWitnessClaims = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';
      const token = localStorage.getItem('detachd_token');
      const res = await fetch(`${API_BASE_URL}/claims?witness=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      } else {
        setClaims([]);
      }
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStatement = async (claimId: string) => {
    setSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';
      const token = localStorage.getItem('detachd_token');
      const res = await fetch(`${API_BASE_URL}/claims/${claimId}/witness-statement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statement })
      });
      if (res.ok) {
        setSuccess(true);
        setStatement('');
      } else {
        alert('Failed to submit statement.');
      }
    } catch {
      alert('Failed to submit statement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <PageHeader title="Claim Details" subtitle="You are a witness on this claim." />
      {claims.length === 0 ? (
        <PixelCard variant="blue">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-text-on-dark-primary mb-2">No claims assigned</h3>
            <p className="text-text-on-dark-secondary">You are not currently a witness on any claims.</p>
          </div>
        </PixelCard>
      ) : (
        claims.map(claim => (
          <PixelCard key={claim.id} variant="blue" className="mb-6">
            <div className="mb-4">
              <div className="text-xl font-bold text-text-on-dark-primary">Claim #{claim.claimNumber}</div>
              <div className="text-sm text-text-on-dark-secondary">Type: {claim.claimType} | Date: {new Date(claim.dateOfLoss).toLocaleDateString()}</div>
              <div className="text-sm text-text-on-dark-secondary">Status: {claim.status}</div>
              {claim.description && <div className="mt-2 text-text-on-dark-secondary">{claim.description}</div>}
            </div>
            <div className="mt-4">
              <Textarea
                label="Your Statement"
                value={statement}
                onChange={e => setStatement(e.target.value)}
                placeholder="Describe what you witnessed..."
                rows={4}
              />
              <Button
                variant="primary"
                className="mt-2"
                onClick={() => handleSubmitStatement(claim.id)}
                isLoading={submitting}
                disabled={!statement.trim() || submitting}
              >
                Submit Statement
              </Button>
              {success && <div className="text-green-400 mt-2">Statement submitted successfully!</div>}
            </div>
          </PixelCard>
        ))
      )}
      <PixelCard variant="gray" className="mt-8">
        <div className="text-sm text-text-on-dark-secondary">Settings: <span className="text-text-on-dark-primary">Change password, logout, or update your profile in the menu.</span></div>
      </PixelCard>
    </div>
  );
}; 