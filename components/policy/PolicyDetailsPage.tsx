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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

interface PolicyDetails {
  id: string;
  policyNumber: string;
  policyType: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled' | 'pending_update_review';
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
  updatesPendingReview?: boolean;
}

const createMockPolicyDetails = (policyId: string, userName: string): PolicyDetails => {
  // Try to load from localStorage first to reflect edits
  try {
    const storedPolicies = localStorage.getItem('userPolicies');
    if (storedPolicies) {
      const allPolicies: PolicyDetails[] = JSON.parse(storedPolicies);
      const existingPolicy = allPolicies.find(p => p.id === policyId);
      if (existingPolicy) {
        // Ensure policyholder details are personalized if not already part of stored data
        if (!existingPolicy.policyholder || !existingPolicy.policyholder.name) {
            existingPolicy.policyholder = {
                name: userName || 'John Smith',
                address: existingPolicy.policyholder?.address || '123 Main Street, Cape Town, 8001',
                phone: existingPolicy.policyholder?.phone || '+27 82 123 4567',
                email: existingPolicy.policyholder?.email || (userName ? `${userName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'john.smith@example.com')
            };
        }
        return existingPolicy;
      }
    }
  } catch (e) { console.error("Failed to parse userPolicies from localStorage for details page", e); }
  
  // Fallback to original mock generation if not in localStorage or error
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
      name: userName || 'John Smith',
      address: '123 Main Street, Cape Town, 8001',
      phone: '+27 82 123 4567',
      email: userName ? `${userName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'john.smith@example.com'
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
  const [isPdfDownloading, setIsPdfDownloading] = useState<string | null>(null);

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
      case 'pending_update_review':
        return 'text-yellow-300 bg-yellow-700/30 border-yellow-500';
      default:
        return 'text-slate-300 bg-slate-700/30 border-slate-500';
    }
  };

  const handleDownloadEnhancedPolicyPdf = async (policyData: PolicyDetails, documentName: string) => {
    setIsPdfDownloading(documentName);
    await new Promise(resolve => setTimeout(resolve, 50));

    const ReactDOM = await import('react-dom');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 40;
    const margin = 40;
    const contentWidth = pageWidth - (2 * margin);

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Policy Document', pageWidth / 2, yPos, { align: 'center' });
    yPos += 30;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFillColor(200, 200, 200);
    pdf.circle(margin + 10, yPos + 5, 8, 'F');
    pdf.text('Verified by Detachd', margin + 25, yPos + 10);
    yPos += 30;

    pdf.text(`Generated: ${new Date().toLocaleDateString('en-ZA', { dateStyle: 'long' })} ${new Date().toLocaleTimeString('en-ZA')}`, margin, yPos);
    yPos += 20;

    const blockchainTxId = `DETACHD-BC-TX-${policyData.id}-${Date.now()}`;
    pdf.text(`Blockchain Ref: ${blockchainTxId}`, margin, yPos);
    yPos += 30;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Policy Information', margin, yPos);
    yPos += 20;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Policy Number: ${policyData.policyNumber}`, margin, yPos); yPos += 15;
    pdf.text(`Policyholder: ${policyData.policyholder.name}`, margin, yPos); yPos += 15;
    pdf.text(`Policy Type: ${policyData.policyType}`, margin, yPos); yPos += 15;
    pdf.text(`Coverage: ${new Date(policyData.coverageStartDate).toLocaleDateString('en-ZA')} - ${new Date(policyData.coverageEndDate).toLocaleDateString('en-ZA')}`, margin, yPos);
    yPos += 30;

    const verificationUrl = `https://verify.detachd.systems/verify?docId=${policyData.id}&num=${policyData.policyNumber}&ts=${Date.now()}`;
    const tempQrContainerId = 'temp-qr-code-container';
    let tempDiv = document.createElement('div');
    tempDiv.id = tempQrContainerId;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const qrCanvas = document.createElement('canvas');
    tempDiv.appendChild(qrCanvas);
    
    try {
      const qrCodeDiv = document.createElement('div');
      qrCodeDiv.style.position = 'absolute';
      qrCodeDiv.style.left = '-10000px';
      document.body.appendChild(qrCodeDiv);
      
      await new Promise<void>(resolve => {
        ReactDOM.render(
          <QRCodeCanvas value={verificationUrl} size={128} id="pdf-qr-code" />, 
          qrCodeDiv,
          () => {
            const canvasElement = document.getElementById('pdf-qr-code') as HTMLCanvasElement;
            if (canvasElement) {
              const qrImageData = canvasElement.toDataURL('image/png');
              pdf.addImage(qrImageData, 'PNG', margin, yPos, 80, 80);
            }
            ReactDOM.unmountComponentAtNode(qrCodeDiv);
            document.body.removeChild(qrCodeDiv);
            resolve();
          }
        );
      });

    } catch (e) {
      console.error("Error generating QR code for PDF:", e);
      pdf.text('[QR Code Error]', margin, yPos + 40);
    } finally {
       if (document.getElementById(tempQrContainerId)) {
         document.body.removeChild(document.getElementById(tempQrContainerId)!);
       }
    }
    yPos += 100;
    
    pdf.setFontSize(8);
    pdf.text('Scan the QR code with your mobile device to verify this document online.', pageWidth / 2, yPos, {align: 'center'});

    pdf.save(`${documentName.replace(/\s+/g, '_')}-${policyData.policyNumber}.pdf`);
    setIsPdfDownloading(null);
  };

  const handleDownloadSimplePdf = async (documentName: string, policyNumber: string) => {
    setIsPdfDownloading(documentName);
    await new Promise(resolve => setTimeout(resolve, 50));
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.setFontSize(18);
    pdf.text(documentName, 40, 40);
    pdf.setFontSize(12);
    pdf.text(`This is a mock document for: ${documentName}`, 40, 70);
    pdf.text(`Policy Number: ${policyNumber}`, 40, 90);
    pdf.text('Generated on: ' + new Date().toLocaleDateString(), 40, 110);
    pdf.save(`${documentName.replace(/\s+/g, '_')}-${policyNumber}.pdf`);
    setIsPdfDownloading(null);
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
              onClick={() => navigate(ROUTES.EDIT_POLICY.replace(':policyId', policy.id))}
              disabled={policy.updatesPendingReview || policy.status === 'pending_update_review'}
            >
              {policy.updatesPendingReview || policy.status === 'pending_update_review' ? 'Review Pending' : 'Edit Policy'}
            </Button>
            <Button 
              variant="primary" 
              leftIcon={<DownloadIcon className="h-4 w-4" />}
              onClick={async () => {
                const input = document.getElementById('policy-details-content');
                if (input && policy) {
                  setIsLoading(true);
                  await new Promise(resolve => setTimeout(resolve, 50));
                  try {
                    const canvas = await html2canvas(input, {
                      scale: 2,
                      useCORS: true,
                      backgroundColor: '#1e293b',
                      onclone: (document) => {
                        Array.from(document.querySelectorAll('*')).forEach(el => {
                            const htmlElement = el as HTMLElement;
                            htmlElement.style.color = window.getComputedStyle(htmlElement).color === 'rgb(0, 0, 0)' || htmlElement.style.color === '' ? '#cbd5e1' : htmlElement.style.color;
                            if(window.getComputedStyle(htmlElement).backgroundColor === 'rgba(0, 0, 0, 0)'){
                            } else {
                                htmlElement.style.backgroundColor = window.getComputedStyle(htmlElement).backgroundColor;
                            }
                        });
                      }
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                    const imgX = (pdfWidth - imgWidth * ratio) / 2;
                    const imgY = 10;

                    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                    pdf.save(`policy-${policy.policyNumber}.pdf`);
                  } catch (pdfError) {
                    console.error("Error generating PDF:", pdfError);
                    alert("Could not generate PDF. Please try again.")
                  }
                  setIsLoading(false);
                } else {
                  alert("Could not find policy content to download.");
                }
              }}
            >
              Download PDF
            </Button>
          </div>
        }
      />

      {(policy.updatesPendingReview || policy.status === 'pending_update_review') && (
        <PixelCard variant="yellow" className="mb-6">
          <div className="p-4 text-center">
            <p className="font-semibold text-yellow-700">
              Your requested policy changes have been submitted and are currently pending review by an insurer.
            </p>
          </div>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="policy-details-content">
        <div className="lg:col-span-2 space-y-6">
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

          <PixelCard 
            variant="blue" 
            title="Coverage Details" 
            icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policy.coverageDetails && policy.coverageDetails.vehicleDamage !== undefined && (
                <DetailItem 
                  label="Vehicle Damage" 
                  value={formatCurrency(policy.coverageDetails.vehicleDamage)} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.thirdParty !== undefined && (
                <DetailItem 
                  label="Third Party Liability" 
                  value={formatCurrency(policy.coverageDetails.thirdParty)} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.theft !== undefined && (
                <DetailItem 
                  label="Theft Cover" 
                  value={formatCurrency(policy.coverageDetails.theft)} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.personalAccident !== undefined && (
                <DetailItem 
                  label="Personal Accident" 
                  value={formatCurrency(policy.coverageDetails.personalAccident)} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.medicalExpenses !== undefined && (
                <DetailItem 
                  label="Medical Expenses" 
                  value={formatCurrency(policy.coverageDetails.medicalExpenses)} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.roadside !== undefined && (
                <DetailItem 
                  label="Roadside Assistance" 
                  value={policy.coverageDetails.roadside ? 'Included' : 'Not Included'} 
                />
              )}
              {policy.coverageDetails && policy.coverageDetails.rental !== undefined && (
                <DetailItem 
                  label="Rental Car" 
                  value={policy.coverageDetails.rental ? 'Included' : 'Not Included'} 
                />
              )}
              {!policy.coverageDetails && (
                <p className="text-sm text-text-on-dark-secondary md:col-span-2">Coverage details are not available for this policy.</p>
              )}
            </div>
          </PixelCard>

          <PixelCard 
            variant="blue" 
            title="Policy Documents" 
            icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="space-y-3">
              <DocumentLink 
                name="Policy Document" 
                policy={policy}
                onDownload={() => handleDownloadEnhancedPolicyPdf(policy, "Policy Document")}
                isDownloading={isPdfDownloading === "Policy Document"}
              />
              <DocumentLink 
                name="Schedule of Assets" 
                policy={policy}
                onDownload={() => handleDownloadSimplePdf("Schedule of Assets", policy.policyNumber)}
                isDownloading={isPdfDownloading === "Schedule of Assets"}
              />
              <DocumentLink 
                name="Terms & Conditions" 
                policy={policy}
                onDownload={() => handleDownloadSimplePdf("Terms & Conditions", policy.policyNumber)}
                isDownloading={isPdfDownloading === "Terms & Conditions"}
              />
            </div>
          </PixelCard>
        </div>

        <div className="space-y-6">
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

          <PixelCard variant="blue" title="Quick Actions">
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate(ROUTES.NEW_CLAIM, { 
                  state: { 
                    policyId: policy.id, 
                    policyNumber: policy.policyNumber 
                  }
                })}
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
  policy: PolicyDetails; 
  onDownload: () => void;
  isDownloading: boolean;
}> = ({ name, policy, onDownload, isDownloading }) => {

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileTextIcon className="h-5 w-5 text-blue-400" />
        <span className="text-sm text-text-on-dark-primary">{name}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onDownload} 
        isLoading={isDownloading}
        disabled={isDownloading}
      >
        {isDownloading ? <LoadingSpinner size="sm" /> : <DownloadIcon className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default PolicyDetailsPage; 