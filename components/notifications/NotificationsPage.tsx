import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Select } from '../common/Select';
import { 
  BellIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  InfoIcon, 
  XCircleIcon,
  ClockIcon,
  FilterIcon,
  MarkUnreadIcon,
  TrashIcon
} from '../common/Icon';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'claim' | 'security';
  category: 'Claims' | 'System' | 'Security' | 'Payments' | 'Updates' | 'Reminders';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  claimId?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  actionText?: string;
  fromUser?: string;
  metadata?: {
    amount?: number;
    location?: string;
    documentType?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'claim',
    category: 'Claims',
    priority: 'high',
    title: 'New Claim Submitted',
    message: 'Claim #DET-2024-001 has been submitted by John Smith for auto accident. Requires immediate review.',
    timestamp: '2024-01-15T14:30:00Z',
    read: false,
    claimId: 'DET-2024-001',
    actionRequired: true,
    actionUrl: '/claims/DET-2024-001',
    actionText: 'Review Claim',
    fromUser: 'John Smith',
    metadata: { amount: 25000, location: 'Cape Town' }
  },
  {
    id: '2',
    type: 'success',
    category: 'Claims',
    priority: 'medium',
    title: 'Claim Approved',
    message: 'Claim #DET-2024-002 has been approved and payment processing has begun.',
    timestamp: '2024-01-15T13:15:00Z',
    read: false,
    claimId: 'DET-2024-002',
    actionRequired: false,
    metadata: { amount: 12000 }
  },
  {
    id: '3',
    type: 'warning',
    category: 'Security',
    priority: 'urgent',
    title: 'Suspicious Activity Detected',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100. Account temporarily locked.',
    timestamp: '2024-01-15T12:45:00Z',
    read: false,
    actionRequired: true,
    actionUrl: '/security/alerts',
    actionText: 'Review Security'
  },
  {
    id: '4',
    type: 'info',
    category: 'System',
    priority: 'low',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM SAST.',
    timestamp: '2024-01-15T11:00:00Z',
    read: true,
    actionRequired: false
  },
  {
    id: '5',
    type: 'claim',
    category: 'Claims',
    priority: 'medium',
    title: 'Document Upload Required',
    message: 'Additional documentation needed for claim #DET-2024-003. Missing police report.',
    timestamp: '2024-01-15T10:30:00Z',
    read: true,
    claimId: 'DET-2024-003',
    actionRequired: true,
    actionUrl: '/claims/DET-2024-003/documents',
    actionText: 'Upload Documents',
    metadata: { documentType: 'Police Report' }
  },
  {
    id: '6',
    type: 'success',
    category: 'Payments',
    priority: 'medium',
    title: 'Payment Processed',
    message: 'Payment of R15,000 has been successfully processed for claim #DET-2024-004.',
    timestamp: '2024-01-15T09:15:00Z',
    read: true,
    metadata: { amount: 15000 }
  },
  {
    id: '7',
    type: 'system',
    category: 'Updates',
    priority: 'low',
    title: 'New Feature Available',
    message: 'AI Risk Assessment 2.0 is now available with improved fraud detection capabilities.',
    timestamp: '2024-01-14T16:00:00Z',
    read: true,
    actionRequired: false,
    actionUrl: '/features/ai-risk',
    actionText: 'Learn More'
  },
  {
    id: '8',
    type: 'warning',
    category: 'Reminders',
    priority: 'medium',
    title: 'Pending Claims Review',
    message: 'You have 3 claims pending review that are approaching their SLA deadline.',
    timestamp: '2024-01-14T14:00:00Z',
    read: true,
    actionRequired: true,
    actionUrl: '/claims?status=pending',
    actionText: 'Review Claims'
  }
];

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    if (categoryFilter) {
      filtered = filtered.filter(n => n.category === categoryFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    setFilteredNotifications(filtered);
  }, [filter, categoryFilter, priorityFilter, notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const sizeClass = priority === 'urgent' ? 'h-6 w-6' : 'h-5 w-5';
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${sizeClass} text-green-400`} />;
      case 'warning':
        return <AlertTriangleIcon className={`${sizeClass} text-yellow-400`} />;
      case 'error':
      case 'security':
        return <XCircleIcon className={`${sizeClass} text-red-400`} />;
      case 'claim':
        return <BellIcon className={`${sizeClass} text-blue-400`} />;
      case 'system':
        return <InfoIcon className={`${sizeClass} text-purple-400`} />;
      default:
        return <InfoIcon className={`${sizeClass} text-slate-400`} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-900/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const categories = Array.from(new Set(notifications.map(n => n.category)));
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <PageHeader 
          title="Notifications" 
          subtitle={`${filteredNotifications.length} notifications • ${unreadCount} unread`}
          actions={
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Button variant="secondary" onClick={markAllAsRead} size="sm">
                  Mark All Read
                </Button>
              )}
              <span className="flex items-center space-x-1">
                <BellIcon className="h-5 w-5 text-slate-400" />
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {unreadCount}
                </span>
              </span>
            </div>
          }
        />

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={[
              { value: 'all', label: 'All Notifications' },
              { value: 'unread', label: 'Unread Only' },
              { value: 'read', label: 'Read Only' }
            ]}
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Select
            options={priorityOptions}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Notifications List */}
        <div className="mt-8 space-y-4">
          {filteredNotifications.length === 0 ? (
            <PixelCard variant="blue" className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications found</h3>
              <p className="text-slate-400">Try adjusting your filters or check back later</p>
            </PixelCard>
          ) : (
            filteredNotifications.map((notification) => (
              <PixelCard 
                key={notification.id} 
                variant="blue" 
                className={`p-0 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'ring-1 ring-blue-500/30' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm font-semibold ${
                              !notification.read ? 'text-white' : 'text-slate-300'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              notification.priority === 'urgent' ? 'bg-red-900/30 text-red-300' :
                              notification.priority === 'high' ? 'bg-orange-900/30 text-orange-300' :
                              notification.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                              'bg-slate-700/30 text-slate-300'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>
                          
                          <p className={`text-sm mb-2 ${
                            !notification.read ? 'text-slate-300' : 'text-slate-400'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            
                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                              {notification.category}
                            </span>
                            
                            {notification.fromUser && (
                              <span className="text-slate-400">from {notification.fromUser}</span>
                            )}
                            
                            {notification.metadata?.amount && (
                              <span className="text-green-400 font-medium">
                                R{notification.metadata.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {notification.read ? (
                              <MarkUnreadIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {notification.actionRequired && notification.actionUrl && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              // In a real app, navigate to the URL
                              console.log('Navigate to:', notification.actionUrl);
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.actionText || 'Take Action'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PixelCard>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="secondary">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};