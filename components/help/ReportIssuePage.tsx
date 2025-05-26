import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { CheckCircleIcon, AlertTriangleIcon } from '../common/Icon';

export const ReportIssuePage: React.FC = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    severity: '',
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: navigator.userAgent,
    email: '',
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

  const issueTypes = [
    { value: 'bug', label: 'Bug/Error' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'ui', label: 'UI/Design Problem' },
    { value: 'accessibility', label: 'Accessibility Issue' },
    { value: 'security', label: 'Security Concern' },
    { value: 'other', label: 'Other' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low - Minor inconvenience' },
    { value: 'medium', label: 'Medium - Affects workflow' },
    { value: 'high', label: 'High - Blocks important functionality' },
    { value: 'critical', label: 'Critical - System unusable' },
  ];

  if (submitted) {
    return (
      <div>
        <PageHeader title="Issue Reported Successfully" showBackButton />
        <PixelCard variant="blue">
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-semibold text-text-on-dark-primary mb-2">
              Thank you for your report!
            </h2>
            <p className="text-text-on-dark-secondary mb-6">
              We've received your issue report and our development team will investigate it shortly.
              You'll receive an email confirmation and updates on the progress.
            </p>
            <div className="space-y-2 text-sm text-text-on-dark-secondary">
              <p><strong>Issue Type:</strong> {issueTypes.find(t => t.value === formData.issueType)?.label}</p>
              <p><strong>Severity:</strong> {severityLevels.find(s => s.value === formData.severity)?.label}</p>
              <p><strong>Reference ID:</strong> ISS-{Date.now().toString().slice(-6)}</p>
            </div>
            <div className="mt-8">
              <Button onClick={() => setSubmitted(false)}>
                Report Another Issue
              </Button>
            </div>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Report an Issue" 
        subtitle="Help us improve Detachd by reporting bugs or suggesting features"
        showBackButton 
      />
      
      <PixelCard variant="blue">
        <div className="flex items-start space-x-3 mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <AlertTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-300 font-medium">Security & Privacy Notice</p>
            <p className="text-amber-200 mt-1">
              Never include personal information like passwords, ID numbers, or sensitive claim details in issue reports.
              For security concerns, use our secure contact form instead.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Issue Type"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              options={issueTypes}
              placeholder="Select issue type"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <Select
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={severityLevels}
              placeholder="Select severity level"
              required
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
          </div>
          
          <Input
            label="Issue Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of the issue"
            required
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          
          <Textarea
            label="Detailed Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          
          <Textarea
            label="Steps to Reproduce (for bugs)"
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            placeholder="1. Go to... &#10;2. Click on... &#10;3. Observe..."
            rows={4}
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Expected Behavior"
              name="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={handleChange}
              placeholder="What should happen?"
              rows={3}
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
            
            <Textarea
              label="Actual Behavior"
              name="actualBehavior"
              value={formData.actualBehavior}
              onChange={handleChange}
              placeholder="What actually happened?"
              rows={3}
              containerClassName="[&>label]:text-text-on-dark-secondary"
            />
          </div>
          
          <Input
            label="Contact Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            containerClassName="[&>label]:text-text-on-dark-secondary"
          />
          
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-on-dark-primary mb-2">Browser Information</p>
            <p className="text-xs text-text-on-dark-secondary font-mono break-all">
              {formData.browserInfo}
            </p>
          </div>
          
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full"
          >
            Submit Issue Report
          </Button>
        </form>
      </PixelCard>
    </div>
  );
}; 