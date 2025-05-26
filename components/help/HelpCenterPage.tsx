import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Input } from '../common/Input';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from '../common/Icon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'faq1',
    question: 'How does Detachd prevent insurance fraud?',
    answer: 'Detachd uses advanced AI to verify images in real-time, ensuring authenticity and preventing fraud. Our platform also analyzes claim patterns and data points to flag suspicious activities using machine learning algorithms specifically trained on South African insurance patterns.',
  },
  {
    id: 'faq2',
    question: 'Who benefits from using Detachd?',
    answer: 'Policyholders benefit from a secure and transparent process, while insurers reduce fraudulent claims and associated costs. First responders and other involved parties also benefit from streamlined information sharing.',
  },
  {
    id: 'faq3',
    question: 'How does Detachd integrate with existing systems?',
    answer: 'Detachd integrates seamlessly with existing insurance systems, providing real-time verification and data exchange without disrupting current workflows. We offer APIs and custom integration solutions.',
  },
  {
    id: 'faq4',
    question: 'Is Detachd compliant with South African regulations?',
    answer: 'Yes, Detachd is fully compliant with POPIA (Protection of Personal Information Act), Financial Services Board (FSB) regulations, and all other relevant South African insurance and data protection laws. We undergo regular compliance audits.',
  },
  {
    id: 'faq5',
    question: 'How long does claim processing take?',
    answer: 'With Detachd\'s AI-powered verification, most claims are processed within 24-48 hours. Simple claims with all required documentation can be approved in as little as 2-4 hours during business hours.',
  },
  {
    id: 'faq6',
    question: 'What types of documents can I upload?',
    answer: 'You can upload photos, videos, PDFs, and audio recordings. Supported formats include JPG, PNG, MP4, PDF, and MP3. Maximum file size is 50MB per document.',
  },
  {
    id: 'faq7',
    question: 'How secure is my personal information?',
    answer: 'Your data is protected with bank-grade encryption, blockchain verification, and secure cloud storage. We use end-to-end encryption for all data transmission and store information in POPIA-compliant South African data centers.',
  },
  {
    id: 'faq8',
    question: 'Can I track my claim status in real-time?',
    answer: 'Yes! Detachd provides real-time claim tracking with instant notifications via SMS, email, and in-app alerts. You can see exactly where your claim is in the process at any time.',
  },
  {
    id: 'faq9',
    question: 'What happens if my claim is rejected?',
    answer: 'If your claim is rejected, you\'ll receive a detailed explanation with reasons and next steps. You can appeal the decision, provide additional documentation, or contact our support team for assistance.',
  },
  {
    id: 'faq10',
    question: 'Do you support multiple South African languages?',
    answer: 'Currently, Detachd operates in English. We are working on adding support for Afrikaans, isiZulu, and isiXhosa in future updates to better serve all South African communities.',
  },
  {
    id: 'faq11',
    question: 'How do I report suspected fraud?',
    answer: 'You can report suspected fraud through our secure reporting system, by calling our fraud hotline at +27 86 000 0000, or by emailing fraud@detachd.systems. All reports are handled confidentially.',
  },
  {
    id: 'faq12',
    question: 'What are your operating hours?',
    answer: 'Our platform operates 24/7. Customer support is available Monday-Friday 8:00 AM - 6:00 PM SAST. Emergency claims support is available 24/7 at +27 86 000 0000.',
  },
  {
    id: 'faq13',
    question: 'Can third parties submit information through Detachd?',
    answer: 'Yes, third parties, witnesses, and first responders can submit information and documentation related to claims through our secure platform with proper verification.',
  },
  {
    id: 'faq14',
    question: 'How does the AI verification work?',
    answer: 'Our AI analyzes uploaded images for tampering, authenticity, and consistency. It checks metadata, lighting patterns, pixel analysis, and compares against known fraud indicators while maintaining privacy.',
  },
  {
    id: 'faq15',
    question: 'What if I need to update my claim after submission?',
    answer: 'You can add additional documentation or information to your claim through the platform. Simply navigate to your claim and use the "Upload Additional Documents" feature.',
  },
  {
    id: 'faq16',
    question: 'How do I access my policy information?',
    answer: 'Your policy details are available in the "My Policy" section of your dashboard. This includes coverage details, premium information, and policy documents.',
  },
  {
    id: 'faq17',
    question: 'Is there a mobile app available?',
    answer: 'Detachd is a Progressive Web App (PWA) that works seamlessly on mobile devices. You can add it to your home screen for app-like functionality without needing to download from app stores.',
  },
  {
    id: 'faq18',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot your password?" on the login page, enter your email address, and follow the instructions sent to your email to reset your password securely.',
  },
  {
    id: 'faq19',
    question: 'What payment methods are accepted for premiums?',
    answer: 'We accept major South African banks\' EFTs, debit orders, credit cards (Visa, Mastercard), and digital payment methods like PayFast and Ozow.',
  },
  {
    id: 'faq20',
    question: 'How can I provide feedback about the platform?',
          answer: 'We welcome your feedback! You can submit suggestions through the Contact Support page, email us at feedback@detachd.systems, or use the feedback option in your account settings.',
  },
  {
    id: 'faq21',
    question: 'How does blockchain verification work on Detachd?',
    answer: 'Detachd uses blockchain technology to create immutable records of all claim data, documents, and verification steps. Each document upload, AI analysis result, and claim decision is recorded on a secure blockchain, ensuring complete transparency and preventing tampering. This creates an unalterable audit trail that all parties can trust.',
  },
  {
    id: 'faq22',
    question: 'What are the benefits of blockchain for my insurance claims?',
    answer: 'Blockchain provides several key benefits: 1) Immutable proof of when documents were submitted, 2) Transparent tracking of claim processing steps, 3) Prevention of document tampering or manipulation, 4) Shared trust between all parties without requiring intermediaries, 5) Faster dispute resolution with verifiable evidence, and 6) Enhanced security for sensitive claim data.',
  },
  {
    id: 'faq23',
    question: 'Can I access the blockchain records of my claim?',
    answer: 'Yes! As a policyholder, you have full access to view the blockchain verification records for your claims. This includes timestamps of document uploads, AI verification results, processing milestones, and approval decisions. You can download a blockchain-verified certificate as proof of your claim\'s authenticity and processing history.',
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

export const HelpCenterPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };
  
  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Help Center" subtitle="Find answers to common questions." />
      
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

      <PixelCard variant="blue" title="Common Questions">
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

      <PixelCard variant="blue" className="mt-6">
        <h2 className="text-xl font-semibold text-text-on-dark-primary mb-2">Still need help?</h2>
        <p className="text-text-on-dark-secondary mb-4">If you can't find what you're looking for, feel free to contact our support team.</p>
        <p className="text-sm text-text-on-dark-secondary">
          Contact Support at <a href="mailto:support@detachd.systems" className="text-blue-300 hover:underline">support@detachd.systems</a> or call us at +27 21 000 0000.
        </p>
      </PixelCard>
    </div>
  );
};