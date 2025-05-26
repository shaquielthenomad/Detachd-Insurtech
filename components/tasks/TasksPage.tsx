import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, UserCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  claimId: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Review Police Report',
          description: 'Verify police report details for claim DET-001',
          priority: 'High',
          status: 'Pending',
          claimId: 'DET-001',
          assignedTo: 'Sarah Chen',
          dueDate: '2025-01-16T17:00:00Z',
          createdAt: '2025-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Request Additional Documentation',
          description: 'Contact policyholder for additional damage photos',
          priority: 'Medium',
          status: 'In Progress',
          claimId: 'DET-002',
          assignedTo: 'Michael Johnson',
          dueDate: '2025-01-17T12:00:00Z',
          createdAt: '2025-01-14T14:30:00Z'
        },
        {
          id: '3',
          title: 'Fraud Investigation',
          description: 'Investigate suspicious activity patterns in claim DET-003',
          priority: 'Urgent',
          status: 'Pending',
          claimId: 'DET-003',
          assignedTo: 'Emma Wilson',
          dueDate: '2025-01-15T18:00:00Z',
          createdAt: '2025-01-13T09:15:00Z'
        },
        {
          id: '4',
          title: 'Final Approval Review',
          description: 'Complete final review for claim approval',
          priority: 'Medium',
          status: 'Completed',
          claimId: 'DET-004',
          assignedTo: 'David Brown',
          dueDate: '2025-01-14T16:00:00Z',
          createdAt: '2025-01-12T11:20:00Z'
        },
      ];
      
      setTasks(mockTasks);
      setIsLoading(false);
    };

    fetchTasks();
  }, []);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent': return 'text-red-400 bg-red-900/30 border-red-500';
      case 'High': return 'text-orange-400 bg-orange-900/30 border-orange-500';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      default: return 'text-green-400 bg-green-900/30 border-green-500';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'In Progress':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'Pending';
    if (filter === 'urgent') return task.priority === 'Urgent';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const urgentCount = tasks.filter(t => t.priority === 'Urgent').length;

  if (isLoading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Tasks Overview" 
        subtitle={`${pendingCount} pending tasks, ${urgentCount} urgent`}
      />
      
      <div className="space-y-6">
        <PixelCard variant="blue">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-text-on-dark-primary">{tasks.length}</p>
              <p className="text-sm text-text-on-dark-secondary">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-sm text-text-on-dark-secondary">Pending</p>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === 'In Progress').length}</p>
              <p className="text-sm text-text-on-dark-secondary">In Progress</p>
            </div>
            <div className="text-center p-4 bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{urgentCount}</p>
              <p className="text-sm text-text-on-dark-secondary">Urgent</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'urgent' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-text-on-dark-secondary hover:text-text-on-dark-primary'
              }`}
            >
              Urgent ({urgentCount})
            </button>
          </div>
        </PixelCard>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <PixelCard key={task.id} variant="blue">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-text-on-dark-primary">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-text-on-dark-secondary mb-3">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-text-on-dark-secondary">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        {task.assignedTo}
                      </div>
                      <div>
                        Claim: <span className="text-blue-400">{task.claimId}</span>
                      </div>
                      <div>
                        Due: {new Date(task.dueDate).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div>
                        Status: <span className={`font-medium ${
                          task.status === 'Completed' ? 'text-green-400' :
                          task.status === 'In Progress' ? 'text-blue-400' : 'text-yellow-400'
                        }`}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {task.status !== 'Completed' && (
                    <>
                      <Button size="sm" variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-700/30">
                        View
                      </Button>
                      <Button size="sm" variant="primary">
                        Update
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </div>
  );
}; 