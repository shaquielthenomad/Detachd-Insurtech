import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import PixelCard from '../common/PixelCard';
import { PageHeader } from '../common/PageHeader';
import { ROUTES, MAX_FILE_SIZE_MB, ACCEPTED_IMAGE_TYPES, MOCK_DELAY } from '../../constants';
import { UploadCloudIcon, CameraIcon } from '../common/Icon';
import { UserRole } from '../../types';

export const UploadIdPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole | undefined;

  const [idFile, setIdFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        setIdFile(null);
        setFilePreview(null);
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`File type not supported. Please upload JPG, PNG, or GIF.`);
        setIdFile(null);
        setFilePreview(null);
        return;
      }
      setIdFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };
  
  const handleTakePhoto = () => {
      if (fileInputRef.current) {
          fileInputRef.current.setAttribute('capture', 'environment');
          fileInputRef.current.click();
      }
      // alert("Camera functionality simulation: Please select a file from your device.");
  };

  const handleSubmit = async () => {
    if (!idFile) {
      setError('Please upload an image of your ID or badge.');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY * 1.5));
    setIsLoading(false);
    navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { state: { success: true, userName: "Verified User", userRole: role } });
  };

  let title = "Upload Professional ID";
  let subtitle = "Please upload a copy of your professional ID or badge.";
  if (role === UserRole.RESPONDER) {
    subtitle = "Ensure the image is clear and all details are visible. Accepted formats: JPG, PNG.";
  } else if (role === UserRole.WITNESS) {
    title = "Upload ID";
    subtitle = "This is required to verify your identity and process your statement. Ensure the image is clear and all details are visible.";
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <PageHeader title={title} subtitle={subtitle} showBackButton />
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="space-y-6">
            <div>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    ref={fileInputRef}
                    id="file-upload-input"
                />
                <label 
                    htmlFor="file-upload-input"
                    className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-blue-400 transition-colors"
                >
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-500" />
                        <div className="flex text-sm text-slate-400">
                            <span className="relative bg-transparent rounded-md font-medium text-blue-300 hover:text-blue-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-blue-500">
                                <span>Upload from device</span>
                            </span>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to {MAX_FILE_SIZE_MB}MB</p>
                    </div>
                </label>
            </div>
            
            <Button 
                variant="outline" 
                onClick={handleTakePhoto} 
                leftIcon={<CameraIcon className="h-5 w-5"/>}
                className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30"
            >
                Take a photo
            </Button>

            {filePreview && (
              <div className="mt-4 text-center">
                <h4 className="text-sm font-medium text-text-on-dark-secondary mb-2">Preview:</h4>
                <img src={filePreview} alt="ID Preview" className="max-h-60 mx-auto rounded-md shadow-md" />
                 <Button variant="ghost" size="sm" onClick={() => { setIdFile(null); setFilePreview(null); if(fileInputRef.current) fileInputRef.current.value = '';}} className="mt-2 text-red-400 hover:text-red-300">
                    Remove Image
                </Button>
              </div>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="pt-4">
              <Button 
                type="button" 
                className="w-full" 
                onClick={handleSubmit} 
                isLoading={isLoading}
                disabled={!idFile}
              >
                Submit ID
              </Button>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  );
};