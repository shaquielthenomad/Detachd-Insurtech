import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { UsersIcon, ShieldCheckIcon, EditIcon, TrashIcon, PlusCircleIcon, UserIcon } from '../common/Icon';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'Claims' | 'Reports' | 'Users' | 'Settings' | 'Analytics';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Claims
  { id: 'claims.view', name: 'View Claims', description: 'Can view all claims in the system', category: 'Claims' },
  { id: 'claims.create', name: 'Create Claims', description: 'Can create new claims', category: 'Claims' },
  { id: 'claims.edit', name: 'Edit Claims', description: 'Can modify existing claims', category: 'Claims' },
  { id: 'claims.approve', name: 'Approve Claims', description: 'Can approve or reject claims', category: 'Claims' },
  { id: 'claims.assign', name: 'Assign Claims', description: 'Can assign claims to team members', category: 'Claims' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'Can access reports dashboard', category: 'Reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can generate custom reports', category: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports to PDF/CSV', category: 'Reports' },
  
  // Users
  { id: 'users.view', name: 'View Users', description: 'Can view user information', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can modify user information', category: 'Users' },
  { id: 'users.deactivate', name: 'Deactivate Users', description: 'Can deactivate user accounts', category: 'Users' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'Can access system settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Can modify system settings', category: 'Settings' },
  
  // Analytics
  { id: 'analytics.view', name: 'View Analytics', description: 'Can access analytics dashboard', category: 'Analytics' },
  { id: 'analytics.advanced', name: 'Advanced Analytics', description: 'Can access detailed analytics', category: 'Analytics' }
];

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Claims Manager',
    description: 'Full access to claims management and team oversight',
    permissions: ['claims.view', 'claims.create', 'claims.edit', 'claims.approve', 'claims.assign', 'reports.view', 'users.view'],
    userCount: 3,
    isSystemRole: false
  },
  {
    id: '2',
    name: 'Claims Adjuster',
    description: 'Can review and process claims but not approve',
    permissions: ['claims.view', 'claims.edit', 'reports.view'],
    userCount: 8,
    isSystemRole: false
  },
  {
    id: '3',
    name: 'Report Analyst',
    description: 'Specialized in generating and analyzing reports',
    permissions: ['reports.view', 'reports.create', 'reports.export', 'analytics.view', 'analytics.advanced'],
    userCount: 2,
    isSystemRole: false
  },
  {
    id: '4',
    name: 'Super Admin',
    description: 'Complete system access and control',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    userCount: 1,
    isSystemRole: true
  }
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@detachd.com', role: 'Claims Manager', status: 'Active', lastActive: '2 hours ago' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@detachd.com', role: 'Claims Adjuster', status: 'Active', lastActive: '1 day ago' },
  { id: '3', name: 'Emma Williams', email: 'emma.williams@detachd.com', role: 'Report Analyst', status: 'Active', lastActive: '3 hours ago' },
  { id: '4', name: 'David Brown', email: 'david.brown@detachd.com', role: 'Claims Adjuster', status: 'Inactive', lastActive: '1 week ago' }
];

export const TeamRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleCreateRole = () => {
    setEditingRole(null);
    setNewRole({ name: '', description: '', permissions: [] });
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...newRole }
          : role
      ));
    } else {
      // Create new role
      const newRoleData: Role = {
        id: Date.now().toString(),
        ...newRole,
        userCount: 0,
        isSystemRole: false
      };
      setRoles(prev => [...prev, newRoleData]);
    }
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? Users with this role will need to be reassigned.')) {
      setRoles(prev => prev.filter(role => role.id !== roleId));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getPermissionName = (permissionId: string) => {
    return AVAILABLE_PERMISSIONS.find(p => p.id === permissionId)?.name || permissionId;
  };

  return (
    <div>
      <PageHeader 
        title="Team Roles & Permissions" 
        subtitle="Manage team member roles and access permissions"
        showBackButton={true}
        backButtonPath="/settings"
        actions={
          <Button 
            onClick={handleCreateRole}
            leftIcon={<PlusCircleIcon className="h-4 w-4" />}
          >
            Create Role
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Roles Management */}
        <PixelCard 
          variant="blue" 
          title="Roles" 
          icon={<ShieldCheckIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{role.name}</h3>
                      {role.isSystemRole && (
                        <span className="px-2 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-200 text-xs rounded">
                          System Role
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-200 text-xs rounded">
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((permissionId) => (
                        <span 
                          key={permissionId}
                          className="px-2 py-1 bg-green-900/20 border border-green-500/30 text-green-200 text-xs rounded"
                        >
                          {getPermissionName(permissionId)}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      leftIcon={<EditIcon className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    {!role.isSystemRole && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Team Members */}
        <PixelCard 
          variant="green" 
          title="Team Members" 
          icon={<UsersIcon className="h-5 w-5 text-green-400" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Member</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{member.name}</div>
                          <div className="text-gray-400 text-sm">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-200 text-sm rounded">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-sm rounded ${
                        member.status === 'Active' 
                          ? 'bg-green-900/30 border border-green-500/30 text-green-200'
                          : 'bg-red-900/30 border border-red-500/30 text-red-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {member.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PixelCard>
      </div>

      {/* Role Creation/Edit Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        className="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Claims Manager"
              required
            />
            <Input
              label="Description"
              value={newRole.description}
              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the role"
              required
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Permissions</h4>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  <h5 className="text-md font-medium text-gray-300 mb-3">{category}</h5>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <Checkbox
                        key={permission.id}
                        id={permission.id}
                        label={permission.name}
                        checked={newRole.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        containerClassName="text-sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!newRole.name || !newRole.description}
            >
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 