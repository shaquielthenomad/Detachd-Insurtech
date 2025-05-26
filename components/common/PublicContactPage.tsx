import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { ROUTES, APP_NAME } from '../../constants';
import LetterGlitch from './LetterGlitch';
import { 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from './Icon';

export const PublicContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Partnership' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'claims', label: 'Claims Information' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <LetterGlitch 
          glitchSpeed={70}
          glitchColors={['#1e3a8a', '#3b82f6', '#93c5fd']}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="text-center mb-8">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h2 className="text-3xl font-bold text-slate-100 mb-2">
              Message Sent Successfully!
            </h2>
            <p className="text-slate-300">
              Thank you for contacting {APP_NAME}. We'll get back to you within 24 hours.
            </p>
          </div>
          
          <div className="bg-slate-800/70 backdrop-blur-sm py-8 px-6 shadow-xl rounded-lg">
            <div className="text-center space-y-4">
              <p className="text-slate-300">
                Reference ID: <span className="font-mono text-blue-400">MSG-{Date.now().toString().slice(-6)}</span>
              </p>
              <div className="space-y-3">
                <Link to={ROUTES.WELCOME}>
                  <Button variant="primary" className="w-full">
                    Return to Home
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-300 hover:bg-slate-700"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LetterGlitch 
        glitchSpeed={70}
        glitchColors={['#1e3a8a', '#3b82f6', '#93c5fd']}
        centerVignette={true}
        outerVignette={true}
        smooth={true}
      />
      
      <div className="relative z-10 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link 
              to={ROUTES.WELCOME} 
              className="inline-flex items-center text-slate-300 hover:text-slate-100 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Contact Us</h1>
            <p className="text-xl text-slate-300">
              Get in touch with the {APP_NAME} team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">
                  Get in Touch
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MailIcon className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-200">Email</p>
                      <a 
                        href="mailto:support@detachd.co.za" 
                        className="text-blue-400 hover:text-blue-300"
                      >
                        support@detachd.co.za
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-200">Phone</p>
                      <a 
                        href="tel:+27210000000" 
                        className="text-blue-400 hover:text-blue-300"
                      >
                        +27 21 000 0000
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-200">Address</p>
                      <p className="text-slate-300">
                        123 Business District<br />
                        Cape Town, 8001<br />
                        South Africa
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <ClockIcon className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-200">Business Hours</p>
                      <p className="text-slate-300">
                        Mon - Fri: 8:00 AM - 6:00 PM SAST<br />
                        Sat: 9:00 AM - 2:00 PM SAST<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-2">
                    <strong>Emergency Claims Hotline:</strong>
                  </p>
                  <a 
                    href="tel:+27210000001" 
                    className="text-lg font-semibold text-red-400 hover:text-red-300"
                  >
                    +27 21 000 0001
                  </a>
                  <p className="text-xs text-slate-400">
                    Available 24/7 for urgent claims
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-6">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      containerClassName="[&>label]:text-slate-200"
                    />
                    
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      containerClassName="[&>label]:text-slate-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 XX XXX XXXX"
                      containerClassName="[&>label]:text-slate-200"
                    />
                    
                    <Select
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      options={contactCategories}
                      placeholder="Select a category"
                      required
                      containerClassName="[&>label]:text-slate-200"
                    />
                  </div>
                  
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your inquiry"
                    required
                    containerClassName="[&>label]:text-slate-200"
                  />
                  
                  <Textarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    required
                    containerClassName="[&>label]:text-slate-200"
                  />
                  
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    For existing customers with account access, please use our 
                    <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 ml-1">
                      secure contact form
                    </Link> after logging in for faster support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 