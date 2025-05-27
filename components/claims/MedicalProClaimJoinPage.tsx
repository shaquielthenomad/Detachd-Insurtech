import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';

// Placeholder QR scanner component
const QRScanner: React.FC<{ onScan: (code: string) => void }> = ({ onScan }) => {
  const [input, setInput] = useState('');
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2">[QR Scanner Placeholder]</div>
      <input
        type="text"
        placeholder="Paste QR code value here for demo"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border rounded px-2 py-1 mb-2"
      />
      <Button onClick={() => onScan(input)} disabled={!input.trim()}>Scan</Button>
    </div>
  );
};

export const MedicalProClaimJoinPage: React.FC = () => {
  const [claim, setClaim] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  const handleScan = async (code: string) => {
    setScanning(true);
    setError('');
    try {
      // Simulate API call to fetch claim by code
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';
      const token = localStorage.getItem('detachd_token');
      const res = await fetch(`${API_BASE_URL}/claims/join-by-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data = await res.json();
        setClaim(data.claim);
      } else {
        setError('Invalid or expired code.');
      }
    } catch {
      setError('Failed to join claim.');
    } finally {
      setScanning(false);
    }
  };

  const handleJoin = async () => {
    setJoined(true);
    // Simulate API call to join claim as medical professional
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <PageHeader title="Join Claim via QR Code" subtitle="Scan the QR code provided by the policyholder or insurer." />
      <PixelCard variant="blue" className="mb-6">
        {!claim ? (
          <QRScanner onScan={handleScan} />
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold text-text-on-dark-primary mb-2">Claim #{claim.claimNumber}</h3>
            <p className="text-text-on-dark-secondary mb-2">Type: {claim.claimType}</p>
            <p className="text-text-on-dark-secondary mb-2">Date: {new Date(claim.dateOfLoss).toLocaleDateString()}</p>
            <Button onClick={handleJoin} disabled={joined} variant="primary">
              {joined ? 'Joined' : 'Join Claim'}
            </Button>
            {joined && <div className="text-green-400 mt-2">You have joined this claim as a medical professional.</div>}
          </div>
        )}
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </PixelCard>
    </div>
  );
}; 