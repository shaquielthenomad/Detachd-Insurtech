import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { PhoneIcon, MailIcon, MapPinIcon } from '../common/Icon';

export const ContactSupportPage: React.FC = () => {
  const location = useLocation();
  const claimContext = location.state?.claimContext;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: claimContext ? 'claim' : '',
    subject: claimContext ? claimContext.subject : '',
    message: claimContext ? `Regarding Claim #${claimContext.claimNumber} (${claimContext.claimType}) for ${claimContext.policyholderName}:\n\n${claimContext.message}` : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (claimContext) {
      setFormData(prev => ({
        ...prev,
        category: 'claim',
        subject: claimContext.subject,
        message: `Regarding Claim #${claimContext.claimNumber} (${claimContext.claimType}) for ${claimContext.policyholderName}:\n\n${claimContext.message}`
      }));
    }
  }, [claimContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const categoryOptions = [
    { value: 'claim', label: 'Claim Support' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account Help' },
    { value: 'billing', label: 'Billing Inquiry' },
    { value: 'fraud', label: 'Report Fraud' },
    { value: 'other', label: 'Other' },
  ];

  if (submitted) {
    return (
      <div>
        <PageHeader title="Support Request Sent" showBackButton />
        <PixelCard variant="blue">
          <div className="text-center py-12">
            <MailIcon className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-semibold text-text-on-dark-primary mb-2">
              Your message has been sent!
            </h2>
            <p className="text-text-on-dark-secondary mb-6">
              We'll get back to you within 24 hours. Check your email for a confirmation.
            </p>
            <Button onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Contact Support" 
        subtitle={claimContext ? `Request information for Claim #${claimContext.claimNumber}` : "Get help with your claims and account"}
        showBackButton 
      />
      
      {claimContext && (
        <PixelCard variant="blue" className="mb-6">
          <div className="bg-blue-900/20 p-4 rounded-md border border-blue-400/30">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Claim Information Request</h3>
            <p className="text-sm text-text-on-dark-secondary">
              <strong>Claim:</strong> #{claimContext.claimNumber} - {claimContext.claimType}<br />
              <strong>Policyholder:</strong> {claimContext.policyholderName}
            </p>
          </div>
        </PixelCard>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PixelCard variant="blue">
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  containerClassName="[&>label]:text-text-on-dark-secondary"
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  containerClassName="[&>label]:text-text-on-dark-secondary"
                />
              </div>
              
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                placeholder="Select a category"
                required
                containerClassName="[&>label]:text-text-on-dark-secondary"
              />
              
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                containerClassName="[&>label]:text-text-on-dark-secondary"
              />
              
              <Textarea
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your issue or question in detail..."
                rows={6}
                required
                containerClassName="[&>label]:text-text-on-dark-secondary"
              />
              
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="w-full"
              >
                Send Message
              </Button>
            </form>
          </PixelCard>
        </div>
        
        <div className="space-y-6">
          <PixelCard variant="blue">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <PhoneIcon className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-text-on-dark-primary font-medium">Phone Support</p>
                  <a 
                    href="tel:+27210000000" 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    +27 21 000 0000
                  </a>
                  <p className="text-xs text-text-on-dark-secondary">Mon-Fri: 8:00 AM - 6:00 PM SAST</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MailIcon className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-text-on-dark-primary font-medium">Email Support</p>
                  <a 
                    href="mailto:support@detachd.systems" 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    support@detachd.systems
                  </a>
                  <p className="text-xs text-text-on-dark-secondary">Response within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-text-on-dark-primary font-medium">Office Address</p>
                  <p className="text-text-on-dark-secondary">Cape Town, South Africa</p>
                </div>
              </div>
            </div>
          </PixelCard>
          
          <PixelCard variant="blue">
            <h3 className="text-lg font-semibold text-text-on-dark-primary mb-4">Emergency Claims</h3>
            <p className="text-text-on-dark-secondary mb-3">
              For urgent claims requiring immediate attention:
            </p>
            <div className="space-y-2">
              <p className="text-text-on-dark-primary font-medium">
                Emergency Hotline: <a 
                  href="tel:+27860000000" 
                  className="text-red-400 hover:text-red-300"
                >
                  +27 86 000 0000
                </a>
              </p>
              <p className="text-xs text-text-on-dark-secondary">Available 24/7</p>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
}; 