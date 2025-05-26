import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { BellIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  claimId?: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'claims'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Claim Approved',
          message: 'Your claim DET-001 has been approved and processed. Payment will be transferred within 2-3 business days.',
          timestamp: '2025-01-15T10:30:00Z',
          read: false,
          claimId: 'clm001'
        },
        {
          id: '2',
          type: 'info',
          title: 'Document Uploaded',
          message: 'New document "damage_photo_2.jpg" has been uploaded to claim DET-001.',
          timestamp: '2025-01-15T09:15:00Z',
          read: true,
          claimId: 'clm001'
        },
        {
          id: '3',
          type: 'warning',
          title: 'Information Required',
          message: 'Additional information needed for claim DET-002. Please provide a police report.',
          timestamp: '2025-01-14T16:45:00Z',
          read: false,
          claimId: 'clm002'
        },
        {
          id: '4',
          type: 'info',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur on January 20th from 2:00 AM - 4:00 AM SAST.',
          timestamp: '2025-01-14T12:00:00Z',
          read: true
        },
        {
          id: '5',
          type: 'success',
          title: 'Account Verified',
          message: 'Your identity verification has been completed successfully.',
          timestamp: '2025-01-13T08:30:00Z',
          read: true
        },
      ];
      
      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <InfoIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'claims') return notif.claimId;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Notifications" 
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />
      
      <div className="space-y-4">
        <PixelCard variant="blue">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('claims')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'claims' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              Claims ({notifications.filter(n => n.claimId).length})
            </button>
          </div>
        </PixelCard>

        {filteredNotifications.length === 0 ? (
          <PixelCard variant="blue">
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
              <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No notifications</h3>
              <p className="mt-1 text-sm text-text-on-dark-secondary">
                {filter === 'unread' ? "You're all caught up!" : "No notifications to display."}
              </p>
            </div>
          </PixelCard>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <PixelCard 
                key={notification.id} 
                variant="blue"
                className={`cursor-pointer transition-opacity ${
                  notification.read ? 'opacity-75' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-medium ${
                        notification.read ? 'text-text-on-dark-secondary' : 'text-text-on-dark-primary'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full inline-block"></span>
                        )}
                      </h3>
                      <p className="text-xs text-text-on-dark-secondary">
                        {new Date(notification.timestamp).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-text-on-dark-secondary">
                      {notification.message}
                    </p>
                    {notification.claimId && (
                      <p className="text-xs text-blue-400 mt-1">
                        Related to claim: {notification.claimId}
                      </p>
                    )}
                  </div>
                </div>
              </PixelCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};