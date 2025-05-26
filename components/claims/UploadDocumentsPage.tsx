import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { ROUTES, MAX_FILE_SIZE_MB, ACCEPTED_DOCUMENT_TYPES, MOCK_DELAY } from '../../constants';
import { UploadCloudIcon, FileTextIcon, CameraIcon, CheckCircleIcon } from '../common/Icon';

interface FileWithPreview extends File {
  preview: string;
}

interface FileInputSectionProps {
    title: string;
    files: FileWithPreview[];
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'other') => void;
    onFileRemove: (fileName: string, type: 'photo' | 'video' | 'other') => void;
    accept: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    idPrefix: string;
}

const FileInputSection: React.FC<FileInputSectionProps> = ({ title, files, onFileChange, onFileRemove, accept, icon, idPrefix }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    return (
        <div>
            <h3 className="text-md font-medium text-text-on-dark-primary mb-2">{title}</h3>
             <input 
                type="file" 
                accept={accept} 
                multiple 
                onChange={(e) => onFileChange(e, 'other' /* This type arg might need to be more specific based on context */)} 
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
                        <div key={file.name} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
                            <div className="flex items-center min-w-0">
                                {file.type.startsWith('image/') && <img src={file.preview} alt="preview" className="h-8 w-8 rounded object-cover mr-2 flex-shrink-0" />}
                                {!file.type.startsWith('image/') && <FileTextIcon className="h-6 w-6 text-slate-400 mr-2 flex-shrink-0" />}
                                <span className="text-xs text-text-on-dark-secondary truncate_">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => onFileRemove(file.name, 'other')} className="text-red-400 hover:text-red-300">Remove</Button>
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

  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [videos, setVideos] = useState<FileWithPreview[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<FileWithPreview[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type) && !file.type.startsWith('video/')) { // Allow general videos
          setError(`File type for "${file.name}" not supported.`);
          continue;
        }
        newFiles.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
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
  
  const handleSubmitDocuments = async () => {
    if (photos.length === 0 && videos.length === 0 && otherDocuments.length === 0) {
        setError('Please upload at least one document or photo/video.');
        return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    setIsLoading(false);
    
    const uploadedFiles = { photos, videos, otherDocuments };
    navigate(ROUTES.NEW_CLAIM_DECLARATION, { 
      state: { 
        claimData: claimDataFromPrevStep, 
        documents: uploadedFiles,
        verificationData 
      } 
    });
  };

  return (
    <div>
      <PageHeader 
        title="Upload Supporting Documents" 
        subtitle="Step 2 of 3: Provide photos, videos, or other relevant files."
        showBackButton 
      />

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
        <div className="space-y-8">
            <FileInputSection
                title="Photos of Incident/Damage"
                files={photos}
                onFileChange={(e) => handleFileChange(e, 'photo')}
                onFileRemove={(name) => handleFileRemove(name, 'photo')}
                accept="image/*"
                icon={<CameraIcon />}
                idPrefix="photos"
            />
             <FileInputSection
                title="Videos (Optional)"
                files={videos}
                onFileChange={(e) => handleFileChange(e, 'video')}
                onFileRemove={(name) => handleFileRemove(name, 'video')}
                accept="video/*"
                icon={<CameraIcon />} // Consider a video icon
                idPrefix="videos"
            />
            <FileInputSection
                title="Other Documents (e.g., Reports, Estimates)"
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
                disabled={photos.length === 0 && videos.length === 0 && otherDocuments.length === 0}
              >
                Next: Declaration
              </Button>
            </div>
        </div>
      </PixelCard>
    </div>
  );
};
