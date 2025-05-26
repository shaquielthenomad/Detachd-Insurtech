import React from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader 
        title="Terms and Conditions" 
        subtitle="Effective Date: January 2025"
        showBackButton 
      />
      
      <PixelCard variant="blue" className="prose prose-invert max-w-none">
        <div className="space-y-6 text-text-on-dark-secondary">
          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">1. Agreement</h2>
            <p>
              By accessing and using Detachd, you agree to be bound by these Terms and Conditions and all applicable laws and regulations in South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">2. Services</h2>
            <p>
              Detachd provides AI-powered insurance claims processing services in compliance with South African insurance regulations. Our platform facilitates secure communication between policyholders, insurers, and third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">3. User Obligations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the platform only for legitimate insurance purposes</li>
              <li>Comply with all applicable South African laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">4. Privacy and Data Protection</h2>
            <p>
              We are committed to protecting your privacy in accordance with the Protection of Personal Information Act (POPIA) and other applicable South African privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">5. Limitation of Liability</h2>
            <p>
              Detachd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">6. Governing Law</h2>
            <p>
              These terms are governed by the laws of South Africa. Any disputes will be resolved in the courts of South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">7. Contact Information</h2>
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <p><strong>Detachd Pty Ltd</strong></p>
              <p>Enterprise Number: 2021/792488/07</p>
              <p>Cape Town, South Africa</p>
              <p>Email: legal@detachd.systems</p>
              <p>Phone: +27 21 000 0000</p>
            </div>
          </section>
        </div>
      </PixelCard>
    </div>
  );
}; 