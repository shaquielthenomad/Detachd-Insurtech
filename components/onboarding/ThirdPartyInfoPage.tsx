import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { UserRole } from '../../types';
import { UserIcon, MailIcon, PhoneIcon, DownloadIcon, PrinterIcon } from '../common/Icon';

// Global country codes with South Africa first
const countryCodes = [
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+93', label: '+93 (Afghanistan)' },
  { value: '+355', label: '+355 (Albania)' },
  { value: '+213', label: '+213 (Algeria)' },
  { value: '+1684', label: '+1684 (American Samoa)' },
  { value: '+376', label: '+376 (Andorra)' },
  { value: '+244', label: '+244 (Angola)' },
  { value: '+1264', label: '+1264 (Anguilla)' },
  { value: '+672', label: '+672 (Antarctica)' },
  { value: '+1268', label: '+1268 (Antigua and Barbuda)' },
  { value: '+54', label: '+54 (Argentina)' },
  { value: '+374', label: '+374 (Armenia)' },
  { value: '+297', label: '+297 (Aruba)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+43', label: '+43 (Austria)' },
  { value: '+994', label: '+994 (Azerbaijan)' },
  { value: '+1242', label: '+1242 (Bahamas)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+1246', label: '+1246 (Barbados)' },
  { value: '+375', label: '+375 (Belarus)' },
  { value: '+32', label: '+32 (Belgium)' },
  { value: '+501', label: '+501 (Belize)' },
  { value: '+229', label: '+229 (Benin)' },
  { value: '+1441', label: '+1441 (Bermuda)' },
  { value: '+975', label: '+975 (Bhutan)' },
  { value: '+591', label: '+591 (Bolivia)' },
  { value: '+387', label: '+387 (Bosnia and Herzegovina)' },
  { value: '+267', label: '+267 (Botswana)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+246', label: '+246 (British Indian Ocean Territory)' },
  { value: '+673', label: '+673 (Brunei)' },
  { value: '+359', label: '+359 (Bulgaria)' },
  { value: '+226', label: '+226 (Burkina Faso)' },
  { value: '+257', label: '+257 (Burundi)' },
  { value: '+855', label: '+855 (Cambodia)' },
  { value: '+237', label: '+237 (Cameroon)' },
  { value: '+1', label: '+1 (Canada)' },
  { value: '+238', label: '+238 (Cape Verde)' },
  { value: '+1345', label: '+1345 (Cayman Islands)' },
  { value: '+236', label: '+236 (Central African Republic)' },
  { value: '+235', label: '+235 (Chad)' },
  { value: '+56', label: '+56 (Chile)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+61', label: '+61 (Christmas Island)' },
  { value: '+61', label: '+61 (Cocos Islands)' },
  { value: '+57', label: '+57 (Colombia)' },
  { value: '+269', label: '+269 (Comoros)' },
  { value: '+242', label: '+242 (Congo)' },
  { value: '+243', label: '+243 (Congo, Democratic Republic)' },
  { value: '+682', label: '+682 (Cook Islands)' },
  { value: '+506', label: '+506 (Costa Rica)' },
  { value: '+225', label: '+225 (Côte d\'Ivoire)' },
  { value: '+385', label: '+385 (Croatia)' },
  { value: '+53', label: '+53 (Cuba)' },
  { value: '+357', label: '+357 (Cyprus)' },
  { value: '+420', label: '+420 (Czech Republic)' },
  { value: '+45', label: '+45 (Denmark)' },
  { value: '+253', label: '+253 (Djibouti)' },
  { value: '+1767', label: '+1767 (Dominica)' },
  { value: '+1809', label: '+1809 (Dominican Republic)' },
  { value: '+593', label: '+593 (Ecuador)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+503', label: '+503 (El Salvador)' },
  { value: '+240', label: '+240 (Equatorial Guinea)' },
  { value: '+291', label: '+291 (Eritrea)' },
  { value: '+372', label: '+372 (Estonia)' },
  { value: '+251', label: '+251 (Ethiopia)' },
  { value: '+500', label: '+500 (Falkland Islands)' },
  { value: '+298', label: '+298 (Faroe Islands)' },
  { value: '+679', label: '+679 (Fiji)' },
  { value: '+358', label: '+358 (Finland)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+594', label: '+594 (French Guiana)' },
  { value: '+689', label: '+689 (French Polynesia)' },
  { value: '+241', label: '+241 (Gabon)' },
  { value: '+220', label: '+220 (Gambia)' },
  { value: '+995', label: '+995 (Georgia)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+233', label: '+233 (Ghana)' },
  { value: '+350', label: '+350 (Gibraltar)' },
  { value: '+30', label: '+30 (Greece)' },
  { value: '+299', label: '+299 (Greenland)' },
  { value: '+1473', label: '+1473 (Grenada)' },
  { value: '+590', label: '+590 (Guadeloupe)' },
  { value: '+1671', label: '+1671 (Guam)' },
  { value: '+502', label: '+502 (Guatemala)' },
  { value: '+224', label: '+224 (Guinea)' },
  { value: '+245', label: '+245 (Guinea-Bissau)' },
  { value: '+592', label: '+592 (Guyana)' },
  { value: '+509', label: '+509 (Haiti)' },
  { value: '+504', label: '+504 (Honduras)' },
  { value: '+852', label: '+852 (Hong Kong)' },
  { value: '+36', label: '+36 (Hungary)' },
  { value: '+354', label: '+354 (Iceland)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+62', label: '+62 (Indonesia)' },
  { value: '+98', label: '+98 (Iran)' },
  { value: '+964', label: '+964 (Iraq)' },
  { value: '+353', label: '+353 (Ireland)' },
  { value: '+972', label: '+972 (Israel)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+1876', label: '+1876 (Jamaica)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+7', label: '+7 (Kazakhstan)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+686', label: '+686 (Kiribati)' },
  { value: '+850', label: '+850 (Korea, North)' },
  { value: '+82', label: '+82 (Korea, South)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+996', label: '+996 (Kyrgyzstan)' },
  { value: '+856', label: '+856 (Laos)' },
  { value: '+371', label: '+371 (Latvia)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+266', label: '+266 (Lesotho)' },
  { value: '+231', label: '+231 (Liberia)' },
  { value: '+218', label: '+218 (Libya)' },
  { value: '+423', label: '+423 (Liechtenstein)' },
  { value: '+370', label: '+370 (Lithuania)' },
  { value: '+352', label: '+352 (Luxembourg)' },
  { value: '+853', label: '+853 (Macao)' },
  { value: '+389', label: '+389 (Macedonia)' },
  { value: '+261', label: '+261 (Madagascar)' },
  { value: '+265', label: '+265 (Malawi)' },
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+960', label: '+960 (Maldives)' },
  { value: '+223', label: '+223 (Mali)' },
  { value: '+356', label: '+356 (Malta)' },
  { value: '+692', label: '+692 (Marshall Islands)' },
  { value: '+596', label: '+596 (Martinique)' },
  { value: '+222', label: '+222 (Mauritania)' },
  { value: '+230', label: '+230 (Mauritius)' },
  { value: '+262', label: '+262 (Mayotte)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+691', label: '+691 (Micronesia)' },
  { value: '+373', label: '+373 (Moldova)' },
  { value: '+377', label: '+377 (Monaco)' },
  { value: '+976', label: '+976 (Mongolia)' },
  { value: '+382', label: '+382 (Montenegro)' },
  { value: '+1664', label: '+1664 (Montserrat)' },
  { value: '+212', label: '+212 (Morocco)' },
  { value: '+258', label: '+258 (Mozambique)' },
  { value: '+95', label: '+95 (Myanmar)' },
  { value: '+264', label: '+264 (Namibia)' },
  { value: '+674', label: '+674 (Nauru)' },
  { value: '+977', label: '+977 (Nepal)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+599', label: '+599 (Netherlands Antilles)' },
  { value: '+687', label: '+687 (New Caledonia)' },
  { value: '+64', label: '+64 (New Zealand)' },
  { value: '+505', label: '+505 (Nicaragua)' },
  { value: '+227', label: '+227 (Niger)' },
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+683', label: '+683 (Niue)' },
  { value: '+672', label: '+672 (Norfolk Island)' },
  { value: '+1670', label: '+1670 (Northern Mariana Islands)' },
  { value: '+47', label: '+47 (Norway)' },
  { value: '+968', label: '+968 (Oman)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+680', label: '+680 (Palau)' },
  { value: '+970', label: '+970 (Palestine)' },
  { value: '+507', label: '+507 (Panama)' },
  { value: '+675', label: '+675 (Papua New Guinea)' },
  { value: '+595', label: '+595 (Paraguay)' },
  { value: '+51', label: '+51 (Peru)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+48', label: '+48 (Poland)' },
  { value: '+351', label: '+351 (Portugal)' },
  { value: '+1787', label: '+1787 (Puerto Rico)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+262', label: '+262 (Réunion)' },
  { value: '+40', label: '+40 (Romania)' },
  { value: '+7', label: '+7 (Russia)' },
  { value: '+250', label: '+250 (Rwanda)' },
  { value: '+290', label: '+290 (Saint Helena)' },
  { value: '+1869', label: '+1869 (Saint Kitts and Nevis)' },
  { value: '+1758', label: '+1758 (Saint Lucia)' },
  { value: '+508', label: '+508 (Saint Pierre and Miquelon)' },
  { value: '+1784', label: '+1784 (Saint Vincent and the Grenadines)' },
  { value: '+685', label: '+685 (Samoa)' },
  { value: '+378', label: '+378 (San Marino)' },
  { value: '+239', label: '+239 (São Tomé and Príncipe)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+221', label: '+221 (Senegal)' },
  { value: '+381', label: '+381 (Serbia)' },
  { value: '+248', label: '+248 (Seychelles)' },
  { value: '+232', label: '+232 (Sierra Leone)' },
  { value: '+65', label: '+65 (Singapore)' },
  { value: '+421', label: '+421 (Slovakia)' },
  { value: '+386', label: '+386 (Slovenia)' },
  { value: '+677', label: '+677 (Solomon Islands)' },
  { value: '+252', label: '+252 (Somalia)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+94', label: '+94 (Sri Lanka)' },
  { value: '+249', label: '+249 (Sudan)' },
  { value: '+597', label: '+597 (Suriname)' },
  { value: '+268', label: '+268 (Swaziland)' },
  { value: '+46', label: '+46 (Sweden)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+963', label: '+963 (Syria)' },
  { value: '+886', label: '+886 (Taiwan)' },
  { value: '+992', label: '+992 (Tajikistan)' },
  { value: '+255', label: '+255 (Tanzania)' },
  { value: '+66', label: '+66 (Thailand)' },
  { value: '+670', label: '+670 (Timor-Leste)' },
  { value: '+228', label: '+228 (Togo)' },
  { value: '+690', label: '+690 (Tokelau)' },
  { value: '+676', label: '+676 (Tonga)' },
  { value: '+1868', label: '+1868 (Trinidad and Tobago)' },
  { value: '+216', label: '+216 (Tunisia)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+993', label: '+993 (Turkmenistan)' },
  { value: '+1649', label: '+1649 (Turks and Caicos Islands)' },
  { value: '+688', label: '+688 (Tuvalu)' },
  { value: '+256', label: '+256 (Uganda)' },
  { value: '+380', label: '+380 (Ukraine)' },
  { value: '+971', label: '+971 (United Arab Emirates)' },
  { value: '+44', label: '+44 (United Kingdom)' },
  { value: '+1', label: '+1 (United States)' },
  { value: '+598', label: '+598 (Uruguay)' },
  { value: '+998', label: '+998 (Uzbekistan)' },
  { value: '+678', label: '+678 (Vanuatu)' },
  { value: '+379', label: '+379 (Vatican City)' },
  { value: '+58', label: '+58 (Venezuela)' },
  { value: '+84', label: '+84 (Vietnam)' },
  { value: '+1284', label: '+1284 (Virgin Islands, British)' },
  { value: '+1340', label: '+1340 (Virgin Islands, U.S.)' },
  { value: '+681', label: '+681 (Wallis and Futuna)' },
  { value: '+212', label: '+212 (Western Sahara)' },
  { value: '+967', label: '+967 (Yemen)' },
  { value: '+260', label: '+260 (Zambia)' },
  { value: '+263', label: '+263 (Zimbabwe)' },
];

interface ThirdPartyData {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
}

export const ThirdPartyInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as UserRole;
  
  const [formData, setFormData] = useState<ThirdPartyData>({
    name: '',
    email: '',
    countryCode: '+27',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    const code = generateCode();
    setGeneratedCode(code);
    setIsCodeGenerated(true);
    setIsLoading(false);
  };

  const handleContinue = () => {
    navigate(ROUTES.ONBOARDING_VERIFICATION_STATUS, { 
      state: { 
        success: true, 
        userName: formData.name,
        userRole: role,
        thirdPartyCode: generatedCode,
        isThirdParty: true,
        skipDashboard: true 
      } 
    });
  };

  if (isCodeGenerated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader 
          title="Third Party Access Code Generated" 
          subtitle="Your unique code has been created"
        />
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
            <div className="text-center space-y-6">
              <div className="bg-green-900/20 border border-green-600/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-400 mb-2">Your Access Code</h3>
                <div className="text-3xl font-mono font-bold text-green-300 tracking-wider">
                  {generatedCode}
                </div>
              </div>
              
              <div className="text-left bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-on-dark-primary mb-2">Next Steps:</h4>
                <ul className="text-sm text-text-on-dark-secondary space-y-1">
                  <li>• Save this code - you'll need it to access claim information</li>
                  <li>• Share this code with the policyholder or their insurer</li>
                  <li>• You'll be notified when you're added to a claim</li>
                  <li>• Information is sent for approval - be on the lookout for updates</li>
                </ul>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>In the meantime:</strong> Explore our features using our demo account. 
                  You'll have limited access until you're officially added to a claim.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const accessInfo = `DETACHD ACCESS CODE\n\nCode: ${generatedCode}\nGenerated: ${new Date().toLocaleString()}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.countryCode} ${formData.phoneNumber}\n\nSave this information securely. You'll need this code to access claim information.\n\n---\nDetachd Pty Ltd\nEnterprise Number: 2021/792488/07\nsupport@detachd.systems`;
                      
                      const blob = new Blob([accessInfo], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `detachd-access-code-${generatedCode}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    leftIcon={<DownloadIcon className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const accessInfo = `DETACHD ACCESS CODE\n\nCode: ${generatedCode}\nGenerated: ${new Date().toLocaleString()}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.countryCode} ${formData.phoneNumber}\n\nSave this information securely. You'll need this code to access claim information.\n\n---\nDetachd Pty Ltd\nEnterprise Number: 2021/792488/07\nsupport@detachd.systems`;
                      
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head><title>Detachd Access Code</title></head>
                            <body style="font-family: monospace; padding: 20px; white-space: pre-line;">
                              ${accessInfo}
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    leftIcon={<PrinterIcon className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Print
                  </Button>
                </div>
                <Button onClick={handleContinue} className="w-full">
                  Continue to Demo Access
                </Button>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Third Party Information" 
        subtitle="Provide your details to be added to a claim"
        showBackButton 
        backButtonPath={ROUTES.ONBOARDING_ROLE_SELECTION}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PixelCard variant="blue" contentClassName="text-text-on-dark-primary">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <UserIcon className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary">
                Personal Information
              </h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary">
              We'll generate a unique code for you to be added to insurance claims.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <div>
              <label className="block text-sm font-medium text-text-on-dark-secondary mb-2">
                Phone Number
              </label>
              <div className="flex space-x-2">
                <Select
                  name="countryCode"
                  options={countryCodes}
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-32"
                />
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="81 234 5678"
                  required
                  containerClassName="flex-1"
                />
              </div>
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              Generate Access Code
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Your information will be shared only with relevant parties for claim processing purposes.
            </p>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}; 