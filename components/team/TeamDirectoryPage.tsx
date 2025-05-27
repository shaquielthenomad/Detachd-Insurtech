import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UsersIcon, SearchIcon, PlusCircleIcon, MailIcon, PhoneIcon, EditIcon } from '../common/Icon';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  permissions: string[];
  joinedDate: string;
  location: string;
  specializations?: string[];
  claimsAssigned: number;
  averageRating: number;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Claims Adjuster',
    department: 'Claims Processing',
    email: 'sarah.chen@detachd.systems',
    phone: '+27 11 123 4567',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=3b82f6&color=fff',
    permissions: ['approve_claims', 'view_analytics', 'manage_documents'],
    joinedDate: '2023-03-15',
    location: 'Cape Town',
    specializations: ['Auto Claims', 'Property Damage'],
    claimsAssigned: 47,
    averageRating: 4.8
  },
  {
    id: '2',
    name: 'Michael Johnson',
    role: 'Claims Investigator',
    department: 'Fraud Prevention',
    email: 'michael.johnson@detachd.systems',
    phone: '+27 21 987 6543',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Johnson&background=10b981&color=fff',
    permissions: ['investigate_fraud', 'access_ai_tools', 'generate_reports'],
    joinedDate: '2023-01-20',
    location: 'Johannesburg',
    specializations: ['Fraud Detection', 'Risk Assessment'],
    claimsAssigned: 23,
    averageRating: 4.6
  },
  {
    id: '3',
    name: 'Emma Wilson',
    role: 'Underwriting Manager',
    department: 'Risk Assessment',
    email: 'emma.wilson@detachd.systems',
    phone: '+27 31 456 7890',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=f59e0b&color=fff',
    permissions: ['approve_policies', 'manage_team', 'view_analytics', 'system_admin'],
    joinedDate: '2022-11-08',
    location: 'Durban',
    specializations: ['Risk Analysis', 'Policy Underwriting'],
    claimsAssigned: 31,
    averageRating: 4.9
  },
  {
    id: '4',
    name: 'David Brown',
    role: 'Claims Specialist',
    department: 'Claims Processing',
    email: 'david.brown@detachd.systems',
    phone: '+27 12 345 6789',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=David+Brown&background=8b5cf6&color=fff',
    permissions: ['process_claims', 'contact_clients', 'upload_documents'],
    joinedDate: '2023-06-12',
    location: 'Pretoria',
    specializations: ['Motor Claims', 'Customer Service'],
    claimsAssigned: 38,
    averageRating: 4.5
  },
  {
    id: '5',
    name: 'Lisa Rodriguez',
    role: 'Senior Fraud Analyst',
    department: 'Fraud Prevention',
    email: 'lisa.rodriguez@detachd.systems',
    phone: '+27 41 234 5678',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lisa+Rodriguez&background=ef4444&color=fff',
    permissions: ['investigate_fraud', 'access_ai_tools', 'approve_investigations', 'train_models'],
    joinedDate: '2022-09-03',
    location: 'Port Elizabeth',
    specializations: ['AI Fraud Detection', 'Pattern Analysis'],
    claimsAssigned: 19,
    averageRating: 4.7
  },
  {
    id: '6',
    name: 'James Thompson',
    role: 'IT Support Specialist',
    department: 'Technology',
    email: 'james.thompson@detachd.systems',
    phone: '+27 51 987 6543',
    status: 'Inactive',
    avatarUrl: 'https://ui-avatars.com/api/?name=James+Thompson&background=6b7280&color=fff',
    permissions: ['system_maintenance', 'user_support', 'backup_management'],
    joinedDate: '2023-02-14',
    location: 'Bloemfontein',
    specializations: ['System Administration', 'User Support'],
    claimsAssigned: 0,
    averageRating: 4.3
  }
];

export const TeamDirectoryPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setTeamMembers(mockTeamMembers);
      setFilteredMembers(mockTeamMembers);
      setIsLoading(false);
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  }, [searchTerm, departmentFilter, statusFilter, teamMembers]);

  const handleEditMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
    }
  };

  const departments = Array.from(new Set(teamMembers.map(member => member.department)));
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map(dept => ({ value: dept, label: dept }))
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading team directory..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <PageHeader 
          title="Team Directory" 
          subtitle={`${filteredMembers.length} team members • ${teamMembers.filter(m => m.status === 'Active').length} active`}
          actions={
            <Button variant="primary" leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
              Add Team Member
            </Button>
          }
        />

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon className="h-5 w-5" />}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Select
            options={departmentOptions}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Team Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-400">{teamMembers.length}</p>
                <p className="text-sm text-text-on-dark-secondary">Total Members</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-900 font-bold text-sm">A</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{teamMembers.filter(m => m.status === 'Active').length}</p>
                <p className="text-sm text-text-on-dark-secondary">Active</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-900 font-bold text-sm">C</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{teamMembers.reduce((sum, m) => sum + m.claimsAssigned, 0)}</p>
                <p className="text-sm text-text-on-dark-secondary">Claims Assigned</p>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue" className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-900 font-bold text-sm">★</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {(teamMembers.reduce((sum, m) => sum + m.averageRating, 0) / teamMembers.length).toFixed(1)}
                </p>
                <p className="text-sm text-text-on-dark-secondary">Avg Rating</p>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Team Members Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <PixelCard key={member.id} variant="blue" className="p-6 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-on-dark-primary truncate">
                      {member.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'Active' 
                        ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                        : 'bg-gray-900/30 text-gray-300 border border-gray-500/30'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-on-dark-secondary mb-1">{member.role}</p>
                  <p className="text-xs text-text-on-dark-secondary mb-3">{member.department}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-text-on-dark-secondary">
                      <MailIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-xs text-text-on-dark-secondary">
                        <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs">
                      <span className="text-text-on-dark-secondary">Claims: </span>
                      <span className="text-blue-400 font-medium">{member.claimsAssigned}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-text-on-dark-secondary">Rating: </span>
                      <span className="text-yellow-400 font-medium">★ {member.averageRating}</span>
                    </div>
                  </div>

                  {member.specializations && member.specializations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {member.specializations.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded"
                          >
                            {spec}
                          </span>
                        ))}
                        {member.specializations.length > 2 && (
                          <span className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded">
                            +{member.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-on-dark-secondary">
                      {member.location}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditMember(member.id)}
                      leftIcon={<EditIcon className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </PixelCard>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="mt-12 text-center">
            <UsersIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No team members found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Member Detail Modal would go here */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Team Member Details</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={selectedMember.avatarUrl}
                    alt={selectedMember.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white mb-2">{selectedMember.name}</h4>
                    <p className="text-blue-400 mb-1">{selectedMember.role}</p>
                    <p className="text-slate-400 mb-4">{selectedMember.department}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <p className="text-white">{selectedMember.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <p className="text-white">{selectedMember.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <p className="text-white">{selectedMember.location}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Joined:</span>
                        <p className="text-white">{new Date(selectedMember.joinedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};