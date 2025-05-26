import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { UserCircleIcon, UsersIcon, BellIcon, HelpCircleIcon, MailIcon, InfoIcon, LogOutIcon, CogIcon, GlobeIcon, ShieldCheckIcon, EyeIcon, LockIcon, FileTextIcon } from '../common/Icon';
import { ROUTES, APP_NAME } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, linkTo, disabled }) => (
  <Link
    to={disabled ? '#' : linkTo}
    className={`block p-4 hover:bg-slate-700/50 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={(e) => disabled && e.preventDefault()}
    aria-disabled={disabled}
  >
    <div className="flex items-start">
      <div className="flex-shrink-0 text-blue-400">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6' })}
      </div>
      <div className="ml-4">
        <h4 className="text-md font-semibold text-text-on-dark-primary">{title}</h4>
        <p className="text-sm text-text-on-dark-secondary mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

export const SettingsPage: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGOUT_SUCCESS);
  };

  const isTeamManagementDisabled = user?.role !== 'Insurer Party';

  const accountSettings = [
    { icon: <UserCircleIcon />, title: 'Account Details', description: 'View and update your personal information.', linkTo: ROUTES.PROFILE },
    { icon: <LockIcon />, title: 'Update Password', description: 'Secure your account by changing your password.', linkTo: ROUTES.SETTINGS_UPDATE_PASSWORD },
    { icon: <BellIcon />, title: 'Notification Preferences', description: 'Choose how you receive alerts.', linkTo: ROUTES.NOTIFICATIONS_SETTINGS },
    { icon: <ShieldCheckIcon />, title: 'Policy Plans', description: 'Manage your insurance policies and coverage.', linkTo: ROUTES.POLICY_PLANS },
    { icon: <CogIcon />, title: 'Delete Account', description: 'Permanently delete your account.', linkTo: ROUTES.SETTINGS_DELETE_ACCOUNT },
  ];

  // Only show team management for insurers
  const insurerSettings = user?.role === 'Insurer Party' ? [
    { icon: <UsersIcon />, title: 'Team Access & Roles', description: 'Manage team members.', linkTo: ROUTES.TEAM_ROLES },
  ] : [];

  const appSettings = [
    { icon: <GlobeIcon />, title: 'Language Settings', description: 'Select your preferred language.', linkTo: ROUTES.SETTINGS_LANGUAGE },
    { icon: <EyeIcon />, title: 'Preferences & Cookies', description: 'Manage cookie settings.', linkTo: ROUTES.SETTINGS_PREFERENCES },
    { icon: <ShieldCheckIcon />, title: 'Data Processing Consent', description: 'Review data processing consent.', linkTo: ROUTES.SETTINGS_DATA_CONSENT },
  ];

  // Insurer-only application settings
  const insurerAppSettings = user?.role === 'Insurer Party' ? [
    { icon: <GlobeIcon />, title: 'Regional Settings', description: 'Set time zone, date format, currency.', linkTo: ROUTES.SETTINGS_REGIONAL },
    { icon: <ShieldCheckIcon />, title: 'Access Controls', description: 'Configure permissions (Admin only).', linkTo: ROUTES.SETTINGS_ACCESS_CONTROLS },
  ] : [];

  const supportSettings = [
    { icon: <HelpCircleIcon />, title: 'Help Center & FAQs', description: 'Find answers to common questions.', linkTo: ROUTES.HELP },
    { icon: <MailIcon />, title: 'Contact Support', description: 'Reach out to our support team.', linkTo: ROUTES.HELP_CONTACT_SUPPORT },
    { icon: <ShieldCheckIcon />, title: 'Verification Issues', description: 'Get help with blockchain verification.', linkTo: ROUTES.HELP_VERIFICATION },
    { icon: <InfoIcon />, title: `About ${APP_NAME}`, description: `Learn more about ${APP_NAME}.`, linkTo: ROUTES.ABOUT_APP },
    { icon: <FileTextIcon />, title: 'Terms & Conditions', description: 'Read our terms of service.', linkTo: ROUTES.TERMS_CONDITIONS },
    { icon: <ShieldCheckIcon />, title: 'Privacy Policy', description: 'Understand how we use your data.', linkTo: ROUTES.PRIVACY_POLICY },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences."/>

      <div className="space-y-8">
        <PixelCard variant="blue" title="Account Settings" icon={<UserCircleIcon className="h-5 w-5 text-blue-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {accountSettings.map(item => <SettingItem key={item.title} {...item} />)}
            {insurerSettings.map(item => <SettingItem key={item.title} {...item} />)}
          </div>
        </PixelCard>

        <PixelCard variant="blue" title="Application Settings" icon={<CogIcon className="h-5 w-5 text-blue-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {appSettings.map(item => <SettingItem key={item.title} {...item} />)}
            {insurerAppSettings.map(item => <SettingItem key={item.title} {...item} />)}
          </div>
        </PixelCard>

        <PixelCard variant="blue" title="Support & Legal" icon={<HelpCircleIcon className="h-5 w-5 text-blue-400" />}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {supportSettings.map(item => <SettingItem key={item.title} {...item} />)}
          </div>
        </PixelCard>

        <div className="mt-8 pt-6 border-t border-medium"> {/* border-medium is light gray */}
          <Button
            variant="danger"
            onClick={handleLogout}
            isLoading={loading}
            leftIcon={<LogOutIcon className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};