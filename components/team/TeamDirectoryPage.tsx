import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard'; // Changed from Card
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TeamMember } from '../../types';
import { PlusCircleIcon, SearchIcon, ChevronRightIcon, EditIcon, UserCircleIcon } from '../common/Icon';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Mock Data
const mockTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Ethan Harper', role: 'Senior Claims Adjuster', email: 'ethan.h@example.com', status: 'Active', avatarUrl: 'https://picsum.photos/seed/ethan/100/100' },
  { id: 'tm2', name: 'Olivia Bennett', role: 'Underwriting Manager', email: 'olivia.b@example.com', status: 'Active', avatarUrl: 'https://picsum.photos/seed/olivia/100/100' },
  { id: 'tm3', name: 'Noah Carter', role: 'Claims Specialist', email: 'noah.c@example.com', status: 'Active', avatarUrl: 'https://picsum.photos/seed/noah/100/100' },
  { id: 'tm4', name: 'Sophia Evans', role: 'Actuarial Analyst', email: 'sophia.e@example.com', status: 'Inactive', avatarUrl: 'https://picsum.photos/seed/sophia/100/100' },
  { id: 'tm5', name: 'Liam Foster', role: 'Risk Management Officer', email: 'liam.f@example.com', status: 'Active', avatarUrl: 'https://picsum.photos/seed/liam/100/100' },
];

export const TeamDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        setTeamMembers(mockTeamMembers);
        setIsLoading(false);
    };
    fetchTeamMembers();
  }, []);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditMember = (memberId: string) => {
    console.log("Edit member:", memberId);
    // navigate(`${ROUTES.TEAM_EDIT_MEMBER.replace(':memberId', memberId)}`); 
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading team members..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Team Directory" 
        subtitle="Manage your team members and their roles."
        actions={
          <Button 
            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
            onClick={() => {/* navigate to add member page */ console.log("Add new team member");}}
          >
            Add Team Member
          </Button>
        }
      />

      <PixelCard variant="blue" className="mb-6" contentClassName="!p-4">
        <Input
          id="search-team-members"
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<SearchIcon className="h-5 w-5 text-slate-400" />}
          containerClassName="mb-0 [&>label]:text-text-on-dark-secondary"
          className="bg-slate-700 border-slate-600 text-text-on-dark-primary placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
        />
      </PixelCard>

      {filteredMembers.length === 0 ? (
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary py-8">No team members found matching your search.</p>
        </PixelCard>
      ) : (
        <PixelCard variant="blue" contentClassName="!p-0"> {/* Remove padding from content for list */}
          <ul className="divide-y divide-slate-700">
            {filteredMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center truncate">
                      {member.avatarUrl ? (
                        <img className="h-10 w-10 rounded-full mr-3" src={member.avatarUrl} alt={member.name} />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-slate-400 mr-3" />
                      )}
                      <div className="truncate">
                        <p className="text-md font-medium text-blue-300 truncate">{member.name}</p>
                        <p className="text-sm text-text-on-dark-secondary truncate">{member.role}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditMember(member.id)} 
                        aria-label={`Edit ${member.name}`}
                        className="text-slate-300 hover:text-blue-300 hover:bg-slate-700 p-1 rounded-md" // Adjusted ghost for dark
                      >
                        <EditIcon className="h-5 w-5"/>
                      </Button>
                      <Link to={`${ROUTES.TEAM_EDIT_MEMBER.replace(':memberId', member.id)}`} className="p-1 rounded-full hover:bg-slate-700"> 
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-text-on-dark-secondary">
                        {member.email}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-text-on-dark-secondary sm:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${member.status === 'Active' ? 'text-green-300 bg-green-700/30 border-green-500' : 'text-red-300 bg-red-700/30 border-red-500'}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </PixelCard>
      )}
    </div>
  );
};