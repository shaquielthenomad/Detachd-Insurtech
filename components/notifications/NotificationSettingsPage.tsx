import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Checkbox';
import { Select } from '../common/Select';
import { BellIcon, MailIcon, PhoneIcon } from '../common/Icon';

interface NotificationSettings {
  emailNotifications: {
    claimUpdates: boolean;
    systemAlerts: boolean;
    documentRequests: boolean;
    paymentNotifications: boolean;
    securityAlerts: boolean;
  };
  smsNotifications: {
    urgentAlerts: boolean;
    claimApprovals: boolean;
    securityAlerts: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    claimUpdates: boolean;
    systemAlerts: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      claimUpdates: true,
      systemAlerts: true,
      documentRequests: true,
      paymentNotifications: true,
      securityAlerts: true,
    },
    smsNotifications: {
      urgentAlerts: true,
      claimApprovals: true,
      securityAlerts: true,
    },
    pushNotifications: {
      enabled: true,
      claimUpdates: true,
      systemAlerts: false,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleEmailChange = (key: keyof NotificationSettings['emailNotifications']) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key],
      },
    }));
  };

  const handleSmsChange = (key: keyof NotificationSettings['smsNotifications']) => {
    setSettings(prev => ({
      ...prev,
      smsNotifications: {
        ...prev.smsNotifications,
        [key]: !prev.smsNotifications[key],
      },
    }));
  };

  const handlePushChange = (key: keyof NotificationSettings['pushNotifications']) => {
    setSettings(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: !prev.pushNotifications[key],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
  ];

  return (
    <div>
      <PageHeader 
        title="Notification Preferences" 
        subtitle="Configure how you receive alerts and updates"
        showBackButton 
      />
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <PixelCard variant="blue" title="Email Notifications" icon={<MailIcon className="h-5 w-5 text-blue-400" />}>
          <div className="space-y-4">
            <div>
              <Checkbox
                label="Claim Updates"
                checked={settings.emailNotifications.claimUpdates}
                onChange={() => handleEmailChange('claimUpdates')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Receive emails when your claims are updated</p>
            </div>
            <div>
              <Checkbox
                label="System Alerts"
                checked={settings.emailNotifications.systemAlerts}
                onChange={() => handleEmailChange('systemAlerts')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Important system maintenance and updates</p>
            </div>
            <div>
              <Checkbox
                label="Document Requests"
                checked={settings.emailNotifications.documentRequests}
                onChange={() => handleEmailChange('documentRequests')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">When additional documents are required</p>
            </div>
            <div>
              <Checkbox
                label="Payment Notifications"
                checked={settings.emailNotifications.paymentNotifications}
                onChange={() => handleEmailChange('paymentNotifications')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Payment confirmations and processing updates</p>
            </div>
            <div>
              <Checkbox
                label="Security Alerts"
                checked={settings.emailNotifications.securityAlerts}
                onChange={() => handleEmailChange('securityAlerts')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Account security and login notifications</p>
            </div>
          </div>
        </PixelCard>

        {/* SMS Notifications */}
        <PixelCard variant="blue" title="SMS Notifications" icon={<PhoneIcon className="h-5 w-5 text-blue-400" />}>
          <div className="space-y-4">
            <div>
              <Checkbox
                label="Urgent Alerts"
                checked={settings.smsNotifications.urgentAlerts}
                onChange={() => handleSmsChange('urgentAlerts')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Critical updates requiring immediate attention</p>
            </div>
            <div>
              <Checkbox
                label="Claim Approvals"
                checked={settings.smsNotifications.claimApprovals}
                onChange={() => handleSmsChange('claimApprovals')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">When your claims are approved or declined</p>
            </div>
            <div>
              <Checkbox
                label="Security Alerts"
                checked={settings.smsNotifications.securityAlerts}
                onChange={() => handleSmsChange('securityAlerts')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Account security notifications via SMS</p>
            </div>
          </div>
        </PixelCard>

        {/* Push Notifications */}
        <PixelCard variant="blue" title="Push Notifications" icon={<BellIcon className="h-5 w-5 text-blue-400" />}>
          <div className="space-y-4">
            <div>
              <Checkbox
                label="Enable Push Notifications"
                checked={settings.pushNotifications.enabled}
                onChange={() => handlePushChange('enabled')}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Allow browser notifications from Detachd</p>
            </div>
            {settings.pushNotifications.enabled && (
              <>
                <div>
                  <Checkbox
                    label="Claim Updates"
                    checked={settings.pushNotifications.claimUpdates}
                    onChange={() => handlePushChange('claimUpdates')}
                  />
                  <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Real-time claim status updates</p>
                </div>
                <div>
                  <Checkbox
                    label="System Alerts"
                    checked={settings.pushNotifications.systemAlerts}
                    onChange={() => handlePushChange('systemAlerts')}
                  />
                  <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Important system notifications</p>
                </div>
              </>
            )}
          </div>
        </PixelCard>

        {/* Frequency Settings */}
        <PixelCard variant="blue" title="Email Frequency">
          <div className="space-y-4">
            <Select
              label="Notification Frequency"
              options={frequencyOptions}
              value={settings.frequency}
              onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value as any }))}
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            <p className="text-sm text-text-on-dark-secondary">
              Choose how often you receive non-urgent email notifications
            </p>
          </div>
        </PixelCard>

        {/* Quiet Hours */}
        <PixelCard variant="blue" title="Quiet Hours">
          <div className="space-y-4">
            <div>
              <Checkbox
                label="Enable Quiet Hours"
                checked={settings.quietHours.enabled}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
                }))}
              />
              <p className="text-sm text-text-on-dark-secondary ml-6 -mt-2">Reduce notifications during specified hours</p>
            </div>
            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.startTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, startTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-input-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-on-dark-secondary mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.endTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, endTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-input-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        </PixelCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            isLoading={isSaving}
            variant={saved ? 'outline' : 'primary'}
          >
            {saved ? 'Settings Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 