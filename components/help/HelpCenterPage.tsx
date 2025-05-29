import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  SearchIcon, 
  PhoneIcon, 
  MailIcon, 
  AlertTriangleIcon,
  FileTextIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
  BarChartIcon,
  CheckCircleIcon
} from '../common/Icon';
import { ROUTES } from '../../constants';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  contact?: string;
}

// Streamlined FAQ for policyholders - most important questions only
const policyholderFAQs: FAQItem[] = [
  {
    id: 'faq1',
    question: 'How long does claim processing take?',
    answer: 'Most claims are processed within 24-48 hours with our AI-powered verification. Simple claims can be approved in as little as 2-4 hours during business hours.',
  },
  {
    id: 'faq2',
    question: 'What documents can I upload for my claim?',
    answer: 'You can upload photos, videos, PDFs, and audio recordings. Supported formats include JPG, PNG, MP4, PDF, and MP3. Maximum file size is 50MB per document.',
  },
  {
    id: 'faq3',
    question: 'How do I track my claim status?',
    answer: 'Detachd provides real-time claim tracking with instant notifications via SMS, email, and in-app alerts. You can see exactly where your claim is in the process at any time.',
  },
  {
    id: 'faq4',
    question: 'What happens if my claim is rejected?',
    answer: 'If your claim is rejected, you\'ll receive a detailed explanation with reasons and next steps. You can appeal the decision, provide additional documentation, or contact our support team.',
  },
  {
    id: 'faq5',
    question: 'How secure is my personal information?',
    answer: 'Your data is protected with bank-grade encryption, blockchain verification, and secure cloud storage. We use end-to-end encryption and store information in POPIA-compliant South African data centers.',
  },
  {
    id: 'faq6',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot your password?" on the login page, enter your email address, and follow the instructions sent to your email to reset your password securely.',
  },
  {
    id: 'faq7',
    question: 'How do I report suspected fraud?',
    answer: 'You can report suspected fraud through our secure reporting system, by calling our fraud hotline at +27 86 000 0000, or by emailing fraud@detachd.systems.',
  },
  {
    id: 'faq8',
    question: 'Is there a mobile app available?',
    answer: 'Detachd is a Progressive Web App (PWA) that works seamlessly on mobile devices. You can add it to your home screen for app-like functionality.',
  },
];

// Direct support options for insurers
const insurerSupportOptions: SupportOption[] = [
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'System issues, integration problems, API troubleshooting',
    action: 'Call Technical Support',
    icon: <CogIcon className="h-6 w-6" />,
    priority: 'high',
    contact: '+27 86 100 1000'
  },
  {
    id: 'escalation',
    title: 'Escalation Desk',
    description: 'High-priority issues, emergency support, critical system failures',
    action: 'Emergency Escalation',
    icon: <AlertTriangleIcon className="h-6 w-6" />,
    priority: 'high',
    contact: '+27 86 100 9999'
  },
  {
    id: 'integration',
    title: 'Integration Support',
    description: 'API integration, system connectivity, data exchange issues',
    action: 'Contact Integration Team',
    icon: <BarChartIcon className="h-6 w-6" />,
    priority: 'medium',
    contact: 'integration@detachd.systems'
  },
  {
    id: 'admin',
    title: 'Account Management',
    description: 'User management, permissions, portfolio setup, billing',
    action: 'Speak to Account Manager',
    icon: <UsersIcon className="h-6 w-6" />,
    priority: 'medium',
    contact: 'accounts@detachd.systems'
  },
  {
    id: 'compliance',
    title: 'Compliance & Security',
    description: 'POPIA compliance, security concerns, audit support',
    action: 'Contact Compliance',
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    priority: 'medium',
    contact: 'compliance@detachd.systems'
  },
  {
    id: 'training',
    title: 'Training & Documentation',
    description: 'Staff training, system documentation, best practices',
    action: 'Access Resources',
    icon: <FileTextIcon className="h-6 w-6" />,
    priority: 'low',
    contact: 'training@detachd.systems'
  },
];

const AccordionItem: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-slate-700">
      <h3>
        <button
          type="button"
          className="flex items-center justify-between w-full py-4 px-2 text-left text-text-on-dark-secondary hover:bg-slate-700/50 focus:outline-none rounded-t-md"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
        >
          <span className="font-medium text-text-on-dark-primary">{item.question}</span>
          <span className="ml-6 h-7 flex items-center">
            {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </span>
        </button>
      </h3>
      {isOpen && (
        <div id={`faq-panel-${item.id}`} className="pb-4 px-2 prose prose-sm max-w-none text-text-on-dark-secondary prose-p:text-text-on-dark-secondary">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const SupportCard: React.FC<{ option: SupportOption }> = ({ option }) => {
  const handleContact = () => {
    if (option.contact?.includes('@')) {
      window.open(`mailto:${option.contact}`, '_blank');
    } else if (option.contact?.startsWith('+')) {
      window.open(`tel:${option.contact}`, '_blank');
    }
  };

  const priorityColor = {
    high: 'border-red-400 bg-red-900/20',
    medium: 'border-yellow-400 bg-yellow-900/20',
    low: 'border-blue-400 bg-blue-900/20'
  }[option.priority];

  const priorityText = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Standard'
  }[option.priority];

  return (
    <div className={`p-6 border rounded-lg ${priorityColor} transition-all hover:bg-opacity-30`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-400">
            {option.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-on-dark-primary">
              {option.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              option.priority === 'high' ? 'bg-red-600/30 text-red-300' :
              option.priority === 'medium' ? 'bg-yellow-600/30 text-yellow-300' :
              'bg-blue-600/30 text-blue-300'
            }`}>
              {priorityText}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-text-on-dark-secondary mb-4">
        {option.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-on-dark-secondary">
          {option.contact?.includes('@') ? (
            <div className="flex items-center">
              <MailIcon className="h-4 w-4 mr-1" />
              {option.contact}
            </div>
          ) : option.contact?.startsWith('+') ? (
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 mr-1" />
              {option.contact}
            </div>
          ) : null}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleContact}
          className="border-blue-400 text-blue-300 hover:bg-blue-700/30"
        >
          {option.action}
        </Button>
      </div>
    </div>
  );
};

export const HelpCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };
  
  const filteredFAQs = policyholderFAQs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isInsurer) {
    // Insurer Help Center - Direct Support Options
    return (
      <div>
        <PageHeader 
          title="Support Center" 
          subtitle="Direct access to technical support and resources for insurance administrators"
        />
        
        {/* System Status Banner */}
        <PixelCard variant="blue" className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-text-on-dark-primary">System Status: Operational</h3>
                <p className="text-sm text-text-on-dark-secondary">All systems running normally • Last updated: 2 minutes ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.STATUS)}>
              View Status Page
            </Button>
          </div>
        </PixelCard>

        {/* Emergency Contact */}
        <PixelCard variant="blue" className="mb-6">
          <div className="bg-red-900/20 border border-red-400/30 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <AlertTriangleIcon className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-300">Emergency Support</h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary mb-3">
              For critical system failures or urgent escalations affecting claim processing:
            </p>
            <div className="flex items-center space-x-4">
              <Button
                variant="danger"
                size="sm"
                onClick={() => window.open('tel:+27861009999', '_blank')}
                leftIcon={<PhoneIcon className="h-4 w-4" />}
              >
                Call +27 86 100 9999
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('mailto:emergency@detachd.systems', '_blank')}
                className="border-red-400 text-red-300 hover:bg-red-700/30"
                leftIcon={<MailIcon className="h-4 w-4" />}
              >
                Email Emergency Team
              </Button>
            </div>
          </div>
        </PixelCard>

        {/* Support Options Grid */}
        <PixelCard variant="blue" title="Support Options" icon={<UsersIcon className="h-5 w-5 text-blue-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insurerSupportOptions.map((option) => (
              <SupportCard key={option.id} option={option} />
            ))}
          </div>
        </PixelCard>

        {/* Quick Resources */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <PixelCard variant="blue" className="p-6">
            <div className="text-center">
              <FileTextIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-2">API Documentation</h3>
              <p className="text-sm text-text-on-dark-secondary mb-4">
                Complete API reference and integration guides
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Docs
              </Button>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-6">
            <div className="text-center">
              <BarChartIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-2">System Analytics</h3>
              <p className="text-sm text-text-on-dark-secondary mb-4">
                Performance metrics and usage statistics
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Analytics
              </Button>
            </div>
          </PixelCard>

          <PixelCard variant="blue" className="p-6">
            <div className="text-center">
              <CogIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-on-dark-primary mb-2">Admin Settings</h3>
              <p className="text-sm text-text-on-dark-secondary mb-4">
                Manage users, permissions, and system configuration
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Open Settings
              </Button>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  // Policyholder Help Center - FAQ System
  return (
    <div>
      <PageHeader title="Help Center" subtitle="Find answers to common questions and get support." />
      
      <PixelCard variant="blue" className="mb-6" contentClassName="!p-4">
        <Input 
            id="faq-search"
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon className="h-5 w-5 text-slate-400"/>}
            containerClassName="mb-0 [&>label]:text-text-on-dark-secondary"
            className="bg-slate-700 border-slate-600 text-text-on-dark-primary placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
        />
      </PixelCard>

      <PixelCard variant="blue" title="Frequently Asked Questions">
        {filteredFAQs.length > 0 ? (
            <div className="divide-y divide-slate-700">
            {filteredFAQs.map((item) => (
                <AccordionItem 
                key={item.id} 
                item={item} 
                isOpen={openFAQ === item.id} 
                onToggle={() => toggleFAQ(item.id)} 
                />
            ))}
            </div>
        ) : (
            <p className="text-center text-text-on-dark-secondary py-8">No FAQs found matching your search term.</p>
        )}
      </PixelCard>

      {/* Contact Support */}
      <PixelCard variant="blue" className="mt-6">
        <h2 className="text-xl font-semibold text-text-on-dark-primary mb-4">Still need help?</h2>
        <p className="text-text-on-dark-secondary mb-6">If you can't find what you're looking for, our support team is here to help.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <MailIcon className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-text-on-dark-primary">Email Support</h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary mb-3">
              Get detailed help with your questions
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('mailto:support@detachd.systems', '_blank')}
              className="w-full"
            >
              Email Support Team
            </Button>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <PhoneIcon className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold text-text-on-dark-primary">Phone Support</h3>
            </div>
            <p className="text-sm text-text-on-dark-secondary mb-3">
              Mon-Fri 8:00 AM - 6:00 PM SAST
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('tel:+27210000000', '_blank')}
              className="w-full border-green-400 text-green-300 hover:bg-green-700/30"
            >
              Call +27 21 000 0000
            </Button>
          </div>
        </div>

        {/* Emergency Claims Support */}
        <div className="mt-4 bg-yellow-900/20 border border-yellow-400/30 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-yellow-300">Emergency Claims Support</h3>
          </div>
          <p className="text-sm text-text-on-dark-secondary mb-3">
            For urgent claim issues outside business hours: <strong>+27 86 000 0000</strong>
          </p>
        </div>
      </PixelCard>
    </div>
  );
};