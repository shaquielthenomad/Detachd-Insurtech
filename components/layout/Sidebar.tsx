import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, FileTextIcon, BarChartIcon, UsersIcon, SettingsIcon, UserCircleIcon, HelpCircleIcon, LogOutIcon, XCircleIcon, ShieldCheckIcon } from '../common/Icon';
import { NavItemType, UserRole } from '../../types';
import { ROUTES, APP_NAME } from '../../constants';
import { useSecureAuth } from '../../contexts/SecureAuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const commonNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'Claims', icon: FileTextIcon },
];

// Role-specific navigation items
const superAdminNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Admin Dashboard', icon: HomeIcon },
  { href: ROUTES.ANALYTICS, label: 'System Analytics', icon: BarChartIcon },
  { href: ROUTES.TEAM, label: 'User Management', icon: UsersIcon },
  { href: ROUTES.REPORTS, label: 'System Reports', icon: BarChartIcon },
];

const insurerNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'All Claims', icon: FileTextIcon },
  { href: ROUTES.TASKS_OVERVIEW, label: 'Tasks', icon: FileTextIcon },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChartIcon },
  { href: ROUTES.REPORTS, label: 'Reports', icon: BarChartIcon },
  { href: ROUTES.TEAM, label: 'Team Management', icon: UsersIcon },
];

const policyholderNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'My Claims', icon: FileTextIcon },
  { href: ROUTES.MY_POLICY, label: 'My Policy', icon: ShieldCheckIcon },
];

const thirdPartyNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'Related Claims', icon: FileTextIcon },
];

const witnessNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'Witness Reports', icon: FileTextIcon },
];

const medicalProfessionalNavItems: NavItemType[] = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { href: ROUTES.CLAIMS, label: 'Medical Claims', icon: FileTextIcon },
  { href: ROUTES.REPORTS, label: 'Medical Reports', icon: BarChartIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, loading } = useSecureAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };
  
  let navItems: NavItemType[];
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      navItems = superAdminNavItems;
      break;
    case UserRole.INSURER_PARTY:
    case UserRole.INSURER_ADMIN:
    case UserRole.INSURER_AGENT:
      navItems = insurerNavItems;
      break;
    case UserRole.POLICYHOLDER:
      navItems = policyholderNavItems;
      break;
    case UserRole.THIRD_PARTY:
      navItems = thirdPartyNavItems;
      break;
    case UserRole.WITNESS:
      navItems = witnessNavItems;
      break;
    case UserRole.MEDICAL_PROFESSIONAL:
      navItems = medicalProfessionalNavItems;
      break;
    case UserRole.LEGAL_PROFESSIONAL:
    case UserRole.GOVERNMENT_OFFICIAL:
    case UserRole.RESPONDER:
      navItems = [
        { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
        { href: ROUTES.CLAIMS, label: 'Assigned Claims', icon: FileTextIcon },
      ];
      break;
    default:
      navItems = [
        { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
      ]; 
  }

  // Add universal items for all authenticated users
  navItems = [
    ...navItems,
    { href: ROUTES.PROFILE, label: 'Profile', icon: UserCircleIcon },
    { href: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon },
    { href: ROUTES.HELP, label: 'Help', icon: HelpCircleIcon },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card-bg text-text-light border-r border-medium"> {/* card-bg is white, text-light is dark gray */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" // ring-primary is blue
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XCircleIcon className="h-6 w-6 text-text-dim" /> {/* text-dim is medium gray */}
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              {/* Ensure logo is visible on white background, or use a specific dark logo variant */}
              <img className="h-8 w-auto" src="https://picsum.photos/seed/logo_dark/40/40" alt={`${APP_NAME} logo`} /> 
              <span className="ml-3 text-xl font-semibold text-text-light">{APP_NAME}</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive ? 'bg-primary text-white' : 'text-text-dim hover:bg-slate-100 hover:text-text-light' 
                    }`
                  }
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <>
                      <item.icon className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-text-dim group-hover:text-text-light'}`} aria-hidden="true" />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
           <div className="flex-shrink-0 flex border-t border-medium p-4">
            <button onClick={handleLogout} disabled={loading} className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-text-dim hover:bg-slate-100 hover:text-text-light">
              <LogOutIcon className="mr-4 h-6 w-6 text-text-dim group-hover:text-text-light" />
              {loading ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">{/* Dummy element */}</div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-card-bg text-text-light border-r border-medium"> 
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                 <img className="h-8 w-auto" src="https://picsum.photos/seed/logo_dark/40/40" alt={`${APP_NAME} logo`} /> 
                 <span className="ml-3 text-xl font-semibold text-text-light">{APP_NAME}</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }: { isActive: boolean }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive ? 'bg-primary text-white' : 'text-text-dim hover:bg-slate-100 hover:text-text-light' 
                      }`
                    }
                  >
                     {({ isActive }: { isActive: boolean }) => (
                        <>
                          <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-text-dim group-hover:text-text-light'}`} aria-hidden="true" />
                          {item.label}
                        </>
                     )}
                  </NavLink>
                ))}
              </nav>
            </div>
             <div className="flex-shrink-0 flex border-t border-medium p-4"> 
              <button onClick={handleLogout} disabled={loading} className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-dim hover:bg-slate-100 hover:text-text-light">
                <LogOutIcon className="mr-3 h-6 w-6 text-text-dim group-hover:text-text-light" />
                 {loading ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};