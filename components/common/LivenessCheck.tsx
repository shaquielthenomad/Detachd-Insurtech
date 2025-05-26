import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './Button';
import PixelCard from './PixelCard';
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from './Icon';

interface LivenessCheckProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (verificationData: { photoDataUrl: string; timestamp: string; }) => void;
  title?: string;
  subtitle?: string;
}

export const LivenessCheck: React.FC<LivenessCheckProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Identity Verification Required",
  subtitle = "Please complete liveness verification to continue"
}) => {
  const [step, setStep] = useState<'permission' | 'instructions' | 'capture' | 'processing' | 'success' | 'error'>('permission');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock face detection simulation
  useEffect(() => {
    if (step === 'capture' && stream) {
      // Simulate face detection after 2 seconds
      const detectFace = setTimeout(() => {
        setFaceDetected(true);
      }, 2000);

      return () => clearTimeout(detectFace);
    }
  }, [step, stream]);

  const requestCameraPermission = async () => {
    try {
      setStep('processing');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setStep('instructions');
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Camera access is required for identity verification. Please allow camera access and try again.');
      setStep('error');
    }
  };

  const startCapture = () => {
    setStep('capture');
    setFaceDetected(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoDataUrl);
    setStep('processing');

    // Simulate processing time
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({
          photoDataUrl,
          timestamp: new Date().toISOString()
        });
        cleanup();
      }, 2000);
    }, 1500);
  }, [onSuccess]);

  // Auto-capture when face is detected
  useEffect(() => {
    if (faceDetected && step === 'capture') {
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            capturePhoto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [faceDetected, step, capturePhoto]);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStep('permission');
    setError('');
    setCapturedPhoto('');
    setFaceDetected(false);
    setCountdown(0);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-slate-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-on-dark-primary">{title}</h2>
              <p className="text-sm text-text-on-dark-secondary mt-1">{subtitle}</p>
            </div>
            <button 
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {step === 'permission' && (
            <div className="text-center space-y-4">
              <CameraIcon className="h-16 w-16 text-blue-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-text-on-dark-primary mb-2">Camera Access Required</h3>
                <p className="text-text-on-dark-secondary text-sm">
                  We need to verify your identity using your device's camera. This helps prevent fraud and ensures claim authenticity.
                </p>
              </div>
              <Button variant="primary" onClick={requestCameraPermission} className="w-full">
                Allow Camera Access
              </Button>
            </div>
          )}

          {step === 'instructions' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-text-on-dark-primary mb-4">Verification Instructions</h3>
                <div className="space-y-2 text-sm text-text-on-dark-secondary text-left">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Position your face in the center of the camera frame</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Ensure good lighting and remove sunglasses/hats</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Look directly at the camera and stay still</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Photo will be taken automatically when face is detected</span>
                  </div>
                </div>
              </div>
              <Button variant="primary" onClick={startCapture} className="w-full">
                Start Verification
              </Button>
            </div>
          )}

          {step === 'capture' && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 bg-black rounded-lg object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Face detection overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-48 h-48 border-4 rounded-full ${
                    faceDetected 
                      ? 'border-green-400 animate-pulse' 
                      : 'border-blue-400 opacity-50'
                  }`}>
                    {faceDetected && countdown > 0 && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-green-400">{countdown}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium">
                  {faceDetected ? (
                    <span className="bg-green-900/70 text-green-200">Face Detected</span>
                  ) : (
                    <span className="bg-blue-900/70 text-blue-200">Position Your Face</span>
                  )}
                </div>
              </div>
              
              <p className="text-center text-sm text-text-on-dark-secondary">
                {faceDetected 
                  ? `Capturing in ${countdown}...` 
                  : 'Position your face within the circle'
                }
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium text-text-on-dark-primary">Processing Verification</h3>
                <p className="text-text-on-dark-secondary text-sm">Analyzing biometric data...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-text-on-dark-primary">Verification Successful</h3>
                <p className="text-text-on-dark-secondary text-sm">Identity confirmed. Proceeding with claim submission...</p>
              </div>
              {capturedPhoto && (
                <div className="mt-4">
                  <img 
                    src={capturedPhoto} 
                    alt="Verification Photo" 
                    className="w-24 h-24 rounded-full mx-auto border-2 border-green-400"
                  />
                </div>
              )}
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-4">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-text-on-dark-primary">Verification Failed</h3>
                <p className="text-text-on-dark-secondary text-sm">{error}</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={requestCameraPermission} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 