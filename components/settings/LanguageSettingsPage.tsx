import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { GlobeIcon, CheckCircleIcon } from '../common/Icon';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  supported: boolean;
}

interface LanguageSettings {
  primaryLanguage: string;
  fallbackLanguage: string;
  dateFormat: string;
  numberFormat: string;
  rtlSupport: boolean;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', supported: true },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', supported: true },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', supported: true },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', supported: true },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', flag: '🇿🇦', supported: false },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇿🇦', supported: false },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', flag: '🇿🇦', supported: false },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', flag: '🇿🇦', supported: false },
  { code: 'nr', name: 'Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦', supported: false },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦', supported: false },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi', flag: '🇿🇦', supported: false }
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (South African)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (01 Jan 2024)' }
];

const NUMBER_FORMATS = [
  { value: 'en-ZA', label: '1,234.56 (South African)' },
  { value: 'en-US', label: '1,234.56 (US)' },
  { value: 'af-ZA', label: '1 234,56 (Afrikaans)' }
];

export const LanguageSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<LanguageSettings>({
    primaryLanguage: 'en',
    fallbackLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-ZA',
    rtlSupport: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supportedLanguages = SUPPORTED_LANGUAGES.filter(lang => lang.supported);
  const upcomingLanguages = SUPPORTED_LANGUAGES.filter(lang => !lang.supported);

  const handleSettingChange = (field: keyof LanguageSettings, value: string | boolean) => {
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
      console.error('Failed to save language settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === settings.primaryLanguage);
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

  const formatNumberExample = (number: number) => {
    return new Intl.NumberFormat(settings.numberFormat).format(number);
  };

  return (
    <div>
      <PageHeader 
        title="Language Settings" 
        subtitle="Configure your language and regional preferences"
        showBackButton={true}
        backButtonPath="/settings"
      />

      <div className="max-w-4xl space-y-6">
        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
            <span className="text-green-200">Language settings saved successfully!</span>
          </div>
        )}

        {/* Primary Language Selection */}
        <PixelCard 
          variant="blue" 
          title="Language Preferences" 
          icon={<GlobeIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Primary Language"
                value={settings.primaryLanguage}
                onChange={(e) => handleSettingChange('primaryLanguage', e.target.value)}
                options={supportedLanguages.map(lang => ({
                  value: lang.code,
                  label: `${lang.flag} ${lang.name} (${lang.nativeName})`
                }))}
              />

              <Select
                label="Fallback Language"
                value={settings.fallbackLanguage}
                onChange={(e) => handleSettingChange('fallbackLanguage', e.target.value)}
                options={supportedLanguages.map(lang => ({
                  value: lang.code,
                  label: `${lang.flag} ${lang.name}`
                }))}
              />
            </div>

            {/* Current Language Preview */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Current Selection:</h4>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCurrentLanguage()?.flag}</span>
                <div>
                  <div className="text-white font-medium">{getCurrentLanguage()?.name}</div>
                  <div className="text-gray-400 text-sm">{getCurrentLanguage()?.nativeName}</div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Regional Format Settings */}
        <PixelCard 
          variant="blue" 
          title="Regional Formats" 
          icon={<GlobeIcon className="h-5 w-5 text-blue-400" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label="Number Format"
                  value={settings.numberFormat}
                  onChange={(e) => handleSettingChange('numberFormat', e.target.value)}
                  options={NUMBER_FORMATS}
                />
                <div className="mt-2 text-sm text-gray-400">
                  Example: R{formatNumberExample(1234.56)}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Supported Languages */}
        <PixelCard 
          variant="green" 
          title="Available Languages"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedLanguages.map((language) => (
              <div 
                key={language.code}
                className="p-3 bg-slate-800/30 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{language.name}</div>
                    <div className="text-gray-400 text-xs">{language.nativeName}</div>
                  </div>
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Coming Soon Languages */}
        <PixelCard 
          variant="default" 
          title="Coming Soon"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLanguages.map((language) => (
              <div 
                key={language.code}
                className="p-3 bg-slate-800/20 rounded-lg border border-gray-600/20"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl grayscale">{language.flag}</span>
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm font-medium">{language.name}</div>
                    <div className="text-gray-500 text-xs">{language.nativeName}</div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                    Soon
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Help us prioritize:</strong> We're working on adding support for all 11 official South African languages. 
              Contact support to request priority for your preferred language.
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