import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { GlobeIcon, CheckCircleIcon, ClockIcon } from '../common/Icon';

interface RegionalSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
  numberFormat: string;
}

const SOUTH_AFRICAN_TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' }
];

const CURRENCIES = [
  { value: 'ZAR', label: 'ZAR - South African Rand (R)' },
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' }
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (South African Standard)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Standard)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (01 Jan 2024)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Jan 01, 2024)' }
];

const TIME_FORMATS = [
  { value: '24h', label: '24-hour (14:30)' },
  { value: '12h', label: '12-hour (2:30 PM)' }
];

const WEEK_START_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' }
];

const NUMBER_FORMATS = [
  { value: 'en-ZA', label: '1,234.56 (South African)' },
  { value: 'en-US', label: '1,234.56 (US)' },
  { value: 'de-DE', label: '1.234,56 (German)' },
  { value: 'fr-FR', label: '1 234,56 (French)' }
];

export const RegionalSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RegionalSettings>({
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    weekStartsOn: 'monday',
    numberFormat: 'en-ZA'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSettingChange = (field: keyof RegionalSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save regional settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExample = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD MMM YYYY':
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${monthNames[date.getMonth()]} ${year}`;
      case 'MMM DD, YYYY':
        const monthNamesLong = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNamesLong[date.getMonth()]} ${day}, ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const formatTimeExample = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (settings.timeFormat === '12h') {
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${displayHours}:${minutes} ${ampm}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  };

  const formatNumberExample = (number: number) => {
    return new Intl.NumberFormat(settings.numberFormat).format(number);
  };

  const formatCurrencyExample = (amount: number) => {
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: settings.timezone }));
    
    const day = localTime.getDate().toString().padStart(2, '0');
    const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
    const year = localTime.getFullYear().toString();
    const hours = localTime.getHours().toString().padStart(2, '0');
    const minutes = localTime.getMinutes().toString().padStart(2, '0');
    const seconds = localTime.getSeconds().toString().padStart(2, '0');
    
    // Format date according to selected format
    let dateStr = '';
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        dateStr = `${day}/${month}/${year}`;
        break;
      case 'MM/DD/YYYY':
        dateStr = `${month}/${day}/${year}`;
        break;
      case 'YYYY-MM-DD':
        dateStr = `${year}-${month}-${day}`;
        break;
      default:
        dateStr = `${day}/${month}/${year}`;
    }
    
    // Format time according to selected format
    let timeStr = '';
    if (settings.timeFormat === '12h') {
      const displayHours = localTime.getHours() === 0 ? 12 : localTime.getHours() > 12 ? localTime.getHours() - 12 : localTime.getHours();
      const ampm = localTime.getHours() >= 12 ? 'PM' : 'AM';
      timeStr = `${displayHours}:${minutes}:${seconds} ${ampm}`;
    } else {
      timeStr = `${hours}:${minutes}:${seconds}`;
    }
    
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <div>
      <PageHeader 
        title="Regional Settings" 
        subtitle="Configure your timezone, currency, and format preferences"
        showBackButton={true}
        backButtonPath="/settings"
      />

      <div className="max-w-4xl space-y-6">
        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
            <span className="text-green-200">Regional settings saved successfully!</span>
          </div>
        )}

        {/* Current Time Display */}
        <PixelCard 
          variant="blue" 
          title="Current Time" 
          icon={<ClockIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="text-center py-4">
            <div className="text-3xl font-mono text-white mb-2">
              {getCurrentTime()}
            </div>
            <div className="text-sm text-gray-400">
              {settings.timezone.replace('_', ' ')}
            </div>
          </div>
        </PixelCard>

        {/* Time & Date Settings */}
        <PixelCard 
          variant="blue" 
          title="Time & Date" 
          icon={<ClockIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  options={SOUTH_AFRICAN_TIMEZONES}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Current time: {getCurrentTime()}
                </div>
              </div>

              <div>
                <Select
                  label="Date Format"
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  options={DATE_FORMATS}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Example: {formatExample(new Date())}
                </div>
              </div>

              <div>
                <Select
                  label="Time Format"
                  value={settings.timeFormat}
                  onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                  options={TIME_FORMATS}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Example: {formatTimeExample(new Date())}
                </div>
              </div>

              <div>
                <Select
                  label="Week Starts On"
                  value={settings.weekStartsOn}
                  onChange={(e) => handleSettingChange('weekStartsOn', e.target.value)}
                  options={WEEK_START_OPTIONS}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Calendar and scheduling preference
                </div>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Currency & Numbers */}
        <PixelCard 
          variant="green" 
          title="Currency & Numbers" 
          icon={<GlobeIcon className="h-5 w-5 text-green-400" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Primary Currency"
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  options={CURRENCIES}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Example: {formatCurrencyExample(1234.56)}
                </div>
              </div>

              <div>
                <Select
                  label="Number Format"
                  value={settings.numberFormat}
                  onChange={(e) => handleSettingChange('numberFormat', e.target.value)}
                  options={NUMBER_FORMATS}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Example: {formatNumberExample(1234.56)}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Preview Section */}
        <PixelCard 
          variant="default" 
          title="Preview"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Sample Claim Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Claim Date:</span>
                  <span className="text-white">{formatExample(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Filed:</span>
                  <span className="text-white">{formatTimeExample(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Claim Amount:</span>
                  <span className="text-white">{formatCurrencyExample(25000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Policy Premium:</span>
                  <span className="text-white">{formatCurrencyExample(1250.50)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">System Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Timezone:</span>
                  <span className="text-white">{settings.timezone.split('/')[1]?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Currency:</span>
                  <span className="text-white">{settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Week Starts:</span>
                  <span className="text-white">{settings.weekStartsOn.charAt(0).toUpperCase() + settings.weekStartsOn.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Number Format:</span>
                  <span className="text-white">{formatNumberExample(9876.54)}</span>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Important Note */}
        <PixelCard variant="blue">
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> These settings affect how dates, times, and currencies are displayed throughout the application. 
              Changes will take effect immediately after saving.
            </p>
          </div>
        </PixelCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="min-w-32"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}; 