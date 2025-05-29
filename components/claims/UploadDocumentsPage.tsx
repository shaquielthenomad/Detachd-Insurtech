import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { ROUTES, MAX_FILE_SIZE_MB, ACCEPTED_DOCUMENT_TYPES, MOCK_DELAY } from '../../constants';
import { UploadCloudIcon, FileTextIcon, CameraIcon, CheckCircleIcon, AlertTriangleIcon, ShieldCheckIcon, EyeIcon } from '../common/Icon';

interface FileWithPreview extends File {
  preview: string;
  fraudFlags?: DocumentFraudFlag[];
}

interface DocumentFraudFlag {
  type: 'handwriting_suspicious' | 'date_altered' | 'document_quality' | 'metadata_inconsistent';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface FraudAlert {
  type: 'early_policy' | 'suspicious_amount' | 'location_mismatch' | 'description_flags' | 'date_inconsistency';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface FileInputSectionProps {
    title: string;
    files: FileWithPreview[];
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'other') => void;
    onFileRemove: (fileName: string, type: 'photo' | 'video' | 'other') => void;
    accept: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    idPrefix: string;
    description?: string;
}

const FileInputSection: React.FC<FileInputSectionProps> = ({ title, files, onFileChange, onFileRemove, accept, icon, idPrefix, description }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    return (
        <div>
            <h3 className="text-md font-medium text-text-on-dark-primary mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-text-on-dark-secondary mb-3">{description}</p>
            )}
             <input 
                type="file" 
                accept={accept} 
                multiple 
                onChange={(e) => onFileChange(e, idPrefix === 'photos' ? 'photo' : idPrefix === 'videos' ? 'video' : 'other')} 
                className="hidden" 
                ref={fileInputRef}
                id={`${idPrefix}-file-input`}
            />
            <label 
                htmlFor={`${idPrefix}-file-input`}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-blue-400 transition-colors"
            >
                <div className="space-y-1 text-center">
                     {React.cloneElement(icon, { className: 'mx-auto h-10 w-10 text-slate-500' })}
                    <div className="flex text-sm text-slate-400">
                        <span className="relative bg-transparent rounded-md font-medium text-blue-300 hover:text-blue-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-blue-500">
                            <span>Upload files</span>
                        </span>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">{accept.split(',').map(type => type.split('/')[1]?.toUpperCase()).join(', ')} up to {MAX_FILE_SIZE_MB}MB each</p>
                </div>
            </label>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map(file => (
                        <div key={file.name} className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
                              <div className="flex items-center min-w-0">
                                  {file.type.startsWith('image/') && <img src={file.preview} alt="preview" className="h-8 w-8 rounded object-cover mr-2 flex-shrink-0" />}
                                  {!file.type.startsWith('image/') && <FileTextIcon className="h-6 w-6 text-slate-400 mr-2 flex-shrink-0" />}
                                  <span className="text-xs text-text-on-dark-secondary truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => onFileRemove(file.name, idPrefix === 'photos' ? 'photo' : idPrefix === 'videos' ? 'video' : 'other')} className="text-red-400 hover:text-red-300">Remove</Button>
                          </div>

                          {/* Document Fraud Flags */}
                          {file.fraudFlags && file.fraudFlags.length > 0 && (
                            <div className="ml-2 space-y-1">
                              {file.fraudFlags.map((flag, index) => (
                                <div key={index} className={`flex items-start space-x-2 p-2 rounded text-xs border-l-2 ${
                                  flag.severity === 'high' ? 'border-red-500 bg-red-900/20' :
                                  flag.severity === 'medium' ? 'border-yellow-500 bg-yellow-900/20' :
                                  'border-blue-500 bg-blue-900/20'
                                }`}>
                                  <AlertTriangleIcon className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                                    flag.severity === 'high' ? 'text-red-400' :
                                    flag.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                                  }`} />
                                  <div>
                                    <span className={`font-medium ${
                                      flag.severity === 'high' ? 'text-red-300' :
                                      flag.severity === 'medium' ? 'text-yellow-300' : 'text-blue-300'
                                    }`}>
                                      {flag.severity.toUpperCase()} RISK:
                                    </span>
                                    <span className="text-text-on-dark-secondary ml-1">{flag.message}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const UploadDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const claimDataFromPrevStep = location.state?.claimData || {};
  const verificationData = location.state?.verificationData;
  const fraudAlerts: FraudAlert[] = location.state?.fraudAlerts || [];
  const riskScore: number = location.state?.riskScore || 25;

  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [videos, setVideos] = useState<FileWithPreview[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<FileWithPreview[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate document fraud analysis
  const analyzeDocument = (file: File): DocumentFraudFlag[] => {
    const flags: DocumentFraudFlag[] = [];
    
    // Simulate handwriting analysis for PDFs and images
    if (file.type.includes('pdf') || file.type.startsWith('image/')) {
      // Random analysis for demo
      const handwritingRisk = Math.random();
      if (handwritingRisk > 0.7) {
        flags.push({
          type: 'handwriting_suspicious',
          severity: 'medium',
          message: 'Potential handwriting inconsistencies detected. Manual review recommended.'
        });
      }

      // Simulate date alteration detection
      const dateAlterationRisk = Math.random();
      if (dateAlterationRisk > 0.8) {
        flags.push({
          type: 'date_altered',
          severity: 'high',
          message: 'Possible date alteration detected in document. Requires verification.'
        });
      }

      // Document quality check
      if (file.size < 50000) { // Very small file
        flags.push({
          type: 'document_quality',
          severity: 'low',
          message: 'Low resolution document. Higher quality scan recommended.'
        });
      }

      // Metadata analysis (simulated)
      const metadataRisk = Math.random();
      if (metadataRisk > 0.75) {
        flags.push({
          type: 'metadata_inconsistent',
          severity: 'medium',
          message: 'Document metadata indicates creation date differs from reported incident date.'
        });
      }
    }

    return flags;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'other') => {
    setError('');
    const newFiles: FileWithPreview[] = [];
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
          continue; 
        }
        if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type) && !file.type.startsWith('video/')) {
          setError(`File type for "${file.name}" not supported.`);
          continue;
        }
        
        // Analyze document for fraud indicators
        const fraudFlags = analyzeDocument(file);
        
        newFiles.push(Object.assign(file, { 
          preview: URL.createObjectURL(file),
          fraudFlags 
        }));
      }
    }
    if (type === 'photo') setPhotos(prev => [...prev, ...newFiles.filter(f => f.type.startsWith('image/'))]);
    else if (type === 'video') setVideos(prev => [...prev, ...newFiles.filter(f => f.type.startsWith('video/'))]);
    else setOtherDocuments(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileName: string, type: 'photo' | 'video' | 'other') => {
    const revokeObjectUrl = (file: FileWithPreview) => URL.revokeObjectURL(file.preview);
    if (type === 'photo') setPhotos(prev => prev.filter(f => { if(f.name === fileName) revokeObjectUrl(f); return f.name !== fileName;}));
    else if (type === 'video') setVideos(prev => prev.filter(f => { if(f.name === fileName) revokeObjectUrl(f); return f.name !== fileName;}));
    else setOtherDocuments(prev => prev.filter(f => { if(f.name === fileName) revokeObjectUrl(f); return f.name !== fileName;}));
  };

  // Calculate total document fraud flags
  const getAllDocumentFlags = (): DocumentFraudFlag[] => {
    const allFlags: DocumentFraudFlag[] = [];
    [...photos, ...videos, ...otherDocuments].forEach(file => {
      if (file.fraudFlags) {
        allFlags.push(...file.fraudFlags);
      }
    });
    return allFlags;
  };
  
  const handleSubmitDocuments = async () => {
    if (photos.length === 0 && videos.length === 0 && otherDocuments.length === 0) {
        setError('Please upload at least one document or photo/video.');
        return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    setIsLoading(false);
    
    const uploadedFiles = { photos, videos, otherDocuments };
    const documentFlags = getAllDocumentFlags();
    
    navigate(ROUTES.NEW_CLAIM_DECLARATION, { 
      state: { 
        claimData: claimDataFromPrevStep, 
        documents: uploadedFiles,
        verificationData,
        fraudAlerts,
        documentFlags,
        riskScore: riskScore + (documentFlags.filter(f => f.severity === 'high').length * 15)
      } 
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-blue-500 bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Upload Supporting Documents" 
        subtitle="Step 2 of 4: Provide photos, videos, or other relevant files for verification."
        showBackButton 
      />

      {/* Risk Assessment Summary */}
      {(fraudAlerts.length > 0 || riskScore > 40) && (
        <PixelCard variant="blue" className="mb-6 border-l-4 border-yellow-500">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-text-on-dark-primary mb-2">Enhanced Documentation Required</h3>
              <p className="text-sm text-text-on-dark-secondary mb-3">
                This claim has been flagged for enhanced review (Risk Score: {riskScore}%). 
                Additional documentation will help expedite processing.
              </p>
              {fraudAlerts.length > 0 && (
                <div className="text-xs text-yellow-300">
                  Active flags: {fraudAlerts.map(alert => alert.type.replace('_', ' ')).join(', ')}
                </div>
              )}
            </div>
          </div>
        </PixelCard>
      )}

      {/* Verification Status */}
      {verificationData && (
        <PixelCard variant="blue" className="mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-text-on-dark-primary">Identity Verified</h3>
              <p className="text-xs text-text-on-dark-secondary">
                Liveness check completed at {new Date(verificationData.timestamp).toLocaleString()}
              </p>
            </div>
            {verificationData.photoDataUrl && (
              <img 
                src={verificationData.photoDataUrl} 
                alt="Verification Photo" 
                className="w-10 h-10 rounded-full border border-green-400"
              />
            )}
          </div>
        </PixelCard>
      )}
      
      <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-on-dark-primary mb-2">Upload Documentation</h3>
          <p className="text-sm text-text-on-dark-secondary">
            Clear, high-quality images and documents help prevent delays. Ensure signatures, dates, and handwriting are clearly visible.
          </p>
        </div>

        <div className="space-y-8">
            <FileInputSection
                title="Photos of Incident/Damage"
                description="Upload clear photos showing the extent of damage from multiple angles"
                files={photos}
                onFileChange={(e) => handleFileChange(e, 'photo')}
                onFileRemove={(name) => handleFileRemove(name, 'photo')}
                accept="image/*"
                icon={<CameraIcon />}
                idPrefix="photos"
            />
             <FileInputSection
                title="Videos (Optional)"
                description="Video evidence can provide additional context for your claim"
                files={videos}
                onFileChange={(e) => handleFileChange(e, 'video')}
                onFileRemove={(name) => handleFileRemove(name, 'video')}
                accept="video/*"
                icon={<CameraIcon />}
                idPrefix="videos"
            />
            <FileInputSection
                title="Official Documents"
                description="Police reports, repair estimates, medical reports, receipts, or other official documentation"
                files={otherDocuments}
                onFileChange={(e) => handleFileChange(e, 'other')}
                onFileRemove={(name) => handleFileRemove(name, 'other')}
                accept=".pdf,image/*"
                icon={<FileTextIcon />}
                idPrefix="other-docs"
            />

            {error && <p className="text-sm text-red-400 text-center py-2">{error}</p>}

            <div className="flex justify-between pt-4 border-t border-slate-700">
              <Button variant="outline" className="border-slate-400 text-slate-300 hover:bg-slate-700/30" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmitDocuments} 
                isLoading={isLoading}
                leftIcon={<EyeIcon className="h-4 w-4" />}
              >
                Next: Review & Submit
              </Button>
            </div>
        </div>
      </PixelCard>
    </div>
  );
};
