import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { ShieldCheckIcon, CheckCircleIcon, AlertTriangleIcon, HelpCircleIcon, MailIcon, DownloadIcon } from '../common/Icon';

interface VerificationIssue {
  id: string;
  title: string;
  description: string;
  solution: string;
  category: 'Certificate' | 'Blockchain' | 'Identity' | 'Document';
  severity: 'High' | 'Medium' | 'Low';
}

const COMMON_ISSUES: VerificationIssue[] = [
  {
    id: '1',
    title: 'Certificate Not Downloading',
    description: 'Unable to download verification certificates after claim approval.',
    solution: 'Check your browser popup settings and ensure JavaScript is enabled. Try refreshing the page and attempting the download again.',
    category: 'Certificate',
    severity: 'High'
  },
  {
    id: '2',
    title: 'Blockchain Verification Failed',
    description: 'Certificate shows as invalid when verified on blockchain.',
    solution: 'This may be due to network delays. Wait 5-10 minutes and try verification again. If issue persists, contact support with your certificate hash.',
    category: 'Blockchain',
    severity: 'High'
  },
  {
    id: '3',
    title: 'Identity Verification Stuck',
    description: 'Biometric verification process is not completing.',
    solution: 'Ensure good lighting and camera permissions are granted. Clear browser cache and try again. Use Chrome or Safari for best results.',
    category: 'Identity',
    severity: 'Medium'
  },
  {
    id: '4',
    title: 'Document Verification Rejected',
    description: 'Uploaded documents are being rejected during verification.',
    solution: 'Ensure documents are clear, not blurry, and all corners are visible. Accepted formats: PDF, JPG, PNG. Maximum size: 10MB.',
    category: 'Document',
    severity: 'Medium'
  },
  {
    id: '5',
    title: 'QR Code Not Scanning',
    description: 'Mobile QR code scanner not working for certificate verification.',
    solution: 'Ensure camera permissions are granted. Clean your camera lens and ensure good lighting. Try scanning from different distances.',
    category: 'Certificate',
    severity: 'Low'
  }
];

export const HelpVerificationPage: React.FC = () => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    issueType: '',
    description: '',
    certificateHash: '',
    email: ''
  });

  const toggleIssue = (issueId: string) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Certificate': return <DownloadIcon className="h-4 w-4" />;
      case 'Blockchain': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'Identity': return <CheckCircleIcon className="h-4 w-4" />;
      case 'Document': return <HelpCircleIcon className="h-4 w-4" />;
      default: return <HelpCircleIcon className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'Low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Support ticket submitted successfully. You will receive a response within 24 hours.');
    setContactForm({ issueType: '', description: '', certificateHash: '', email: '' });
  };

  return (
    <div>
      <PageHeader 
        title="Verification Help" 
        subtitle="Get help with blockchain verification, certificates, and identity issues"
        showBackButton={true}
        backButtonPath="/help"
      />

      <div className="space-y-6">
        {/* Quick Actions */}
        <PixelCard 
          variant="blue" 
          title="Quick Actions" 
          icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.open('https://blockexplorer.com', '_blank')}
            >
              <ShieldCheckIcon className="h-6 w-6 mb-2" />
              <span>Verify Certificate</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.open('/help/contact-support', '_self')}
            >
              <MailIcon className="h-6 w-6 mb-2" />
              <span>Contact Support</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.print()}
            >
              <DownloadIcon className="h-6 w-6 mb-2" />
              <span>Download Guide</span>
            </Button>
          </div>
        </PixelCard>

        {/* Common Issues */}
        <PixelCard 
          variant="green" 
          title="Common Verification Issues" 
          icon={<AlertTriangleIcon className="h-5 w-5 text-green-400" />}
        >
          <div className="space-y-4">
            {COMMON_ISSUES.map((issue) => (
              <div key={issue.id} className="border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleIssue(issue.id)}
                  className="w-full p-4 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(issue.category)}
                      <span className="text-white font-medium">{issue.title}</span>
                      <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="px-2 py-1 bg-blue-900/20 border border-blue-500/30 text-blue-200 text-xs rounded">
                        {issue.category}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {expandedIssue === issue.id ? '−' : '+'}
                    </span>
                  </div>
                </button>
                
                {expandedIssue === issue.id && (
                  <div className="px-4 pb-4 border-t border-slate-700/50">
                    <div className="pt-3 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Problem:</h4>
                        <p className="text-sm text-gray-400">{issue.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Solution:</h4>
                        <p className="text-sm text-white">{issue.solution}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Verification Steps */}
        <PixelCard 
          variant="blue" 
          title="Certificate Verification Process"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Manual Verification</h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <span>Locate the certificate hash on your document</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <span>Visit the blockchain explorer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <span>Enter the hash in the search field</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    <span>Verify the transaction details match</span>
                  </li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-3">QR Code Verification</h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <span>Open camera app or QR scanner</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <span>Point camera at the QR code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <span>Tap the verification link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    <span>Review the verification results</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Contact Support Form */}
        <PixelCard 
          variant="red" 
          title="Still Need Help?" 
          icon={<MailIcon className="h-5 w-5 text-red-400" />}
        >
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={contactForm.issueType}
                onChange={(e) => setContactForm(prev => ({ ...prev, issueType: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                required
              >
                <option value="">Select Issue Type</option>
                <option value="certificate">Certificate Issues</option>
                <option value="blockchain">Blockchain Verification</option>
                <option value="identity">Identity Verification</option>
                <option value="document">Document Verification</option>
                <option value="other">Other</option>
              </select>
              
              <input
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            
            <input
              type="text"
              placeholder="Certificate Hash (if applicable)"
              value={contactForm.certificateHash}
              onChange={(e) => setContactForm(prev => ({ ...prev, certificateHash: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
            
            <textarea
              placeholder="Describe your verification issue in detail..."
              value={contactForm.description}
              onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              required
            />
            
            <Button type="submit" className="w-full">
              Submit Support Request
            </Button>
          </form>
        </PixelCard>
      </div>
    </div>
  );
}; 