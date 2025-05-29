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

  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';
  const isPolicyholder = user?.role === 'policyholder';

  // Role-based settings configuration
  const getSettingsConfig = () => {
    if (isInsurer) {
      return {
        accountSettings: [
          { icon: <UserCircleIcon />, title: 'Account Details', description: 'View and update your professional information.', linkTo: ROUTES.PROFILE },
          { icon: <LockIcon />, title: 'Update Password', description: 'Secure your account by changing your password.', linkTo: ROUTES.SETTINGS_UPDATE_PASSWORD },
          { icon: <UsersIcon />, title: 'Team Access & Roles', description: 'Manage team members and permissions.', linkTo: ROUTES.TEAM_ROLES },
          { icon: <ShieldCheckIcon />, title: 'Portfolio Management', description: 'Switch between insurer portfolios and manage policies.', linkTo: '/portfolio' },
        ],
        operationalSettings: [
          { icon: <BellIcon />, title: 'Notification Preferences', description: 'Configure claim alerts and system notifications.', linkTo: ROUTES.NOTIFICATIONS_SETTINGS },
          { icon: <GlobeIcon />, title: 'Regional Settings', description: 'Set time zone, date format, currency.', linkTo: ROUTES.SETTINGS_REGIONAL },
          { icon: <GlobeIcon />, title: 'Language Settings', description: 'Select your preferred language.', linkTo: ROUTES.SETTINGS_LANGUAGE },
          { icon: <ShieldCheckIcon />, title: 'Access Controls', description: 'Configure permissions and security settings.', linkTo: ROUTES.SETTINGS_ACCESS_CONTROLS },
        ],
        supportSettings: [
          { icon: <MailIcon />, title: 'Contact Support', description: 'Reach out to our business support team.', linkTo: ROUTES.HELP_CONTACT_SUPPORT },
          { icon: <FileTextIcon />, title: 'Terms & Conditions', description: 'Review our business terms of service.', linkTo: ROUTES.TERMS_CONDITIONS },
          { icon: <ShieldCheckIcon />, title: 'Privacy Policy', description: 'Understand our data handling policies.', linkTo: ROUTES.PRIVACY_POLICY },
        ]
      };
    } else {
      // Policyholder and other user roles get full settings
      return {
        accountSettings: [
          { icon: <UserCircleIcon />, title: 'Account Details', description: 'View and update your personal information.', linkTo: ROUTES.PROFILE },
          { icon: <LockIcon />, title: 'Update Password', description: 'Secure your account by changing your password.', linkTo: ROUTES.SETTINGS_UPDATE_PASSWORD },
          { icon: <BellIcon />, title: 'Notification Preferences', description: 'Choose how you receive alerts.', linkTo: ROUTES.NOTIFICATIONS_SETTINGS },
          { icon: <ShieldCheckIcon />, title: 'My Policy', description: 'Manage your insurance policies and coverage.', linkTo: ROUTES.MY_POLICY },
        ],
        applicationSettings: [
          { icon: <GlobeIcon />, title: 'Language Settings', description: 'Select your preferred language.', linkTo: ROUTES.SETTINGS_LANGUAGE },
          { icon: <GlobeIcon />, title: 'Regional Settings', description: 'Set time zone, date format, currency.', linkTo: ROUTES.SETTINGS_REGIONAL },
          { icon: <EyeIcon />, title: 'Preferences & Cookies', description: 'Manage cookie settings.', linkTo: ROUTES.SETTINGS_PREFERENCES },
          { icon: <ShieldCheckIcon />, title: 'Data Processing Consent', description: 'Review data processing consent.', linkTo: ROUTES.SETTINGS_CONSENT },
        ],
        supportSettings: [
          { icon: <HelpCircleIcon />, title: 'Help Center & FAQs', description: 'Find answers to common questions.', linkTo: ROUTES.HELP },
          { icon: <MailIcon />, title: 'Contact Support', description: 'Reach out to our support team.', linkTo: ROUTES.HELP_CONTACT_SUPPORT },
          { icon: <ShieldCheckIcon />, title: 'Verification Issues', description: 'Get help with blockchain verification.', linkTo: ROUTES.HELP_VERIFICATION },
          { icon: <InfoIcon />, title: `About ${APP_NAME}`, description: `Learn more about ${APP_NAME}.`, linkTo: ROUTES.ABOUT_APP },
          { icon: <FileTextIcon />, title: 'Terms & Conditions', description: 'Read our terms of service.', linkTo: ROUTES.TERMS_CONDITIONS },
          { icon: <ShieldCheckIcon />, title: 'Privacy Policy', description: 'Understand how we use your data.', linkTo: ROUTES.PRIVACY_POLICY },
          { icon: <CogIcon />, title: 'Delete Account', description: 'Permanently delete your account.', linkTo: ROUTES.SETTINGS_DELETE_ACCOUNT },
        ]
      };
    }
  };

  const settingsConfig = getSettingsConfig();

  return (
    <div>
      <PageHeader 
        title="Settings" 
        subtitle={isInsurer ? "Manage your business account and operational settings." : "Manage your account and preferences."}
      />

      <div className="space-y-8">
        {/* Account Management Section */}
        <PixelCard 
          variant="blue" 
          title={isInsurer ? "Account Management" : "Account Settings"} 
          icon={<UserCircleIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {settingsConfig.accountSettings.map(item => <SettingItem key={item.title} {...item} />)}
          </div>
        </PixelCard>

        {/* Operational Settings (Insurer) or Application Settings (Others) */}
        {isInsurer ? (
          <PixelCard 
            variant="blue" 
            title="Operational Settings" 
            icon={<CogIcon className="h-5 w-5 text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {settingsConfig.operationalSettings?.map(item => <SettingItem key={item.title} {...item} />)}
            </div>
          </PixelCard>
        ) : (
          settingsConfig.applicationSettings && (
            <PixelCard 
              variant="blue" 
              title="Application Settings" 
              icon={<CogIcon className="h-5 w-5 text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {settingsConfig.applicationSettings.map(item => <SettingItem key={item.title} {...item} />)}
              </div>
            </PixelCard>
          )
        )}

        {/* Support & Legal Section */}
        <PixelCard 
          variant="blue" 
          title={isInsurer ? "Support & Compliance" : "Support & Legal"} 
          icon={<HelpCircleIcon className="h-5 w-5 text-blue-400" />}
        >
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {settingsConfig.supportSettings.map(item => <SettingItem key={item.title} {...item} />)}
          </div>
        </PixelCard>

        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t border-slate-700">
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