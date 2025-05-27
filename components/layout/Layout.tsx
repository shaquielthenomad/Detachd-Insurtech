import React from 'react';
import Dock, { DockAppItem } from '../common/Dock';
import { useSecureAuth } from '../../contexts/SecureAuthContext';
import { UserRole, NavItemType } from '../../types';
import { ROUTES, APP_NAME } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, FileTextIcon, BarChartIcon, UsersIcon, SettingsIcon, UserCircleIcon, HelpCircleIcon, LogOutIcon, ShieldCheckIcon } from '../common/Icon';
import { IntelligentAgentPanel } from '../common/IntelligentAgentPanel';

interface LayoutProps {
  children: React.ReactNode;
}

const commonNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'Claims', icon: FileTextIcon },
];

const insurerNavItems: NavItemType[] = [
  ...commonNavItems,
  { href: ROUTES.REPORTS, label: 'Reports', icon: BarChartIcon },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChartIcon }, // Re-using, consider unique icon
  { href: ROUTES.TEAM, label: 'Team', icon: UsersIcon },
];

const policyholderNavItems: NavItemType[] = [
  ...commonNavItems,
  { href: ROUTES.MY_POLICY, label: 'My Policy', icon: ShieldCheckIcon },
];

// Common items for all authenticated users, appearing after role-specific ones
const universalPostNavItems: NavItemType[] = [
    { href: ROUTES.PROFILE, label: 'Profile', icon: UserCircleIcon },
    { href: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon },
    { href: ROUTES.HELP, label: 'Help', icon: HelpCircleIcon },
];


export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useSecureAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/welcome');
  };

  let baseNavItems: NavItemType[];
  switch (user?.role) {
    case UserRole.INSURER_PARTY:
      baseNavItems = insurerNavItems;
      break;
    case UserRole.POLICYHOLDER:
      baseNavItems = policyholderNavItems;
      break;
    default:
      baseNavItems = commonNavItems; 
  }

  const finalNavItems = [...baseNavItems, ...universalPostNavItems];
  
  const dockItems: DockAppItem[] = finalNavItems.map(item => ({
    id: item.label.toLowerCase().replace(/\s+/g, '-'),
    icon: <item.icon className="w-full h-full" />, // Adjusted size for DockIcon
    label: item.label,
    onClick: () => navigate(item.href),
  }));

  // Add logout to the dock
  dockItems.push({
    id: 'logout',
    icon: <LogOutIcon className="w-full h-full" />,
    label: 'Log Out',
    onClick: handleLogout,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6 sm:p-8 lg:p-10 pb-24"> {/* Added pb-24 for Dock */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Dock items={dockItems} baseItemSize={44} magnification={28} distance={80} />
      <IntelligentAgentPanel />
    </div>
  );
};