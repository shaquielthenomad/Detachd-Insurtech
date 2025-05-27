import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ROUTES } from '../../constants';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XMarkIcon } from '../common/Icon';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  claimId?: string;
}

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification,
}) => {
  const navigate = useNavigate();

  if (!notification) {
    return null;
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'warning':
        return <AlertTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'error':
        return <AlertTriangleIcon className="h-6 w-6 text-red-400" />;
      default:
        return <InfoIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const handleViewClaim = () => {
    if (notification.claimId) {
      navigate(ROUTES.CLAIM_DETAILS.replace(':claimId', notification.claimId));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} dialogClassName="max-w-lg">
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl text-text-on-dark-primary">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getIcon(notification.type)}
            <h2 className="text-xl font-semibold">{notification.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="text-sm text-text-on-dark-secondary mb-1">
          {new Date(notification.timestamp).toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        
        <p className="mb-4 text-text-on-dark-primary whitespace-pre-wrap">{notification.message}</p>

        {notification.type === 'success' && notification.title === 'Claim Approved' && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-md text-sm">
            <p className="font-semibold mb-1">Payment Information:</p>
            <p>Payment is typically processed within 2-3 business days after approval.</p>
            <p>You will receive a separate notification once the payment has been disbursed.</p>
            <p>You can monitor the status of your claim for any updates.</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          {notification.claimId && (
            <Button variant="primary" onClick={handleViewClaim}>
              View Claim Details
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 