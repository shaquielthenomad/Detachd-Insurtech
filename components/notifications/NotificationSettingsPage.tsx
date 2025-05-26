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
            <Checkbox
              label="Claim Updates"
              description="Receive emails when your claims are updated"
              checked={settings.emailNotifications.claimUpdates}
              onChange={() => handleEmailChange('claimUpdates')}
            />
            <Checkbox
              label="System Alerts"
              description="Important system maintenance and updates"
              checked={settings.emailNotifications.systemAlerts}
              onChange={() => handleEmailChange('systemAlerts')}
            />
            <Checkbox
              label="Document Requests"
              description="When additional documents are required"
              checked={settings.emailNotifications.documentRequests}
              onChange={() => handleEmailChange('documentRequests')}
            />
            <Checkbox
              label="Payment Notifications"
              description="Payment confirmations and processing updates"
              checked={settings.emailNotifications.paymentNotifications}
              onChange={() => handleEmailChange('paymentNotifications')}
            />
            <Checkbox
              label="Security Alerts"
              description="Account security and login notifications"
              checked={settings.emailNotifications.securityAlerts}
              onChange={() => handleEmailChange('securityAlerts')}
            />
          </div>
        </PixelCard>

        {/* SMS Notifications */}
        <PixelCard variant="blue" title="SMS Notifications" icon={<PhoneIcon className="h-5 w-5 text-blue-400" />}>
          <div className="space-y-4">
            <Checkbox
              label="Urgent Alerts"
              description="Critical updates requiring immediate attention"
              checked={settings.smsNotifications.urgentAlerts}
              onChange={() => handleSmsChange('urgentAlerts')}
            />
            <Checkbox
              label="Claim Approvals"
              description="When your claims are approved or declined"
              checked={settings.smsNotifications.claimApprovals}
              onChange={() => handleSmsChange('claimApprovals')}
            />
            <Checkbox
              label="Security Alerts"
              description="Account security notifications via SMS"
              checked={settings.smsNotifications.securityAlerts}
              onChange={() => handleSmsChange('securityAlerts')}
            />
          </div>
        </PixelCard>

        {/* Push Notifications */}
        <PixelCard variant="blue" title="Push Notifications" icon={<BellIcon className="h-5 w-5 text-blue-400" />}>
          <div className="space-y-4">
            <Checkbox
              label="Enable Push Notifications"
              description="Allow browser notifications from Detachd"
              checked={settings.pushNotifications.enabled}
              onChange={() => handlePushChange('enabled')}
            />
            {settings.pushNotifications.enabled && (
              <>
                <Checkbox
                  label="Claim Updates"
                  description="Real-time claim status updates"
                  checked={settings.pushNotifications.claimUpdates}
                  onChange={() => handlePushChange('claimUpdates')}
                />
                <Checkbox
                  label="System Alerts"
                  description="Important system notifications"
                  checked={settings.pushNotifications.systemAlerts}
                  onChange={() => handlePushChange('systemAlerts')}
                />
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
            <Checkbox
              label="Enable Quiet Hours"
              description="Reduce notifications during specified hours"
              checked={settings.quietHours.enabled}
              onChange={() => setSettings(prev => ({
                ...prev,
                quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
              }))}
            />
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