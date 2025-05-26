import React from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900">
      <PageHeader 
        title="Privacy Policy" 
        subtitle="POPIA Compliant - Effective Date: January 2025"
        showBackButton 
      />
      
      <PixelCard variant="blue" className="prose prose-invert max-w-none">
        <div className="space-y-6 text-text-on-dark-secondary">
          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">1. Information We Collect</h2>
            <p>
              We collect personal information necessary to provide insurance claims processing services, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Identity and contact information</li>
              <li>Policy and claim details</li>
              <li>Supporting documents and evidence</li>
              <li>Communication records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">2. How We Use Your Information</h2>
            <p>
              Your personal information is used to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Process and assess insurance claims</li>
              <li>Verify identity and prevent fraud</li>
              <li>Communicate with relevant parties</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our AI-powered services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">3. Data Security</h2>
            <p>
              We implement robust security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure cloud storage with access controls</li>
              <li>Regular security audits and monitoring</li>
              <li>Blockchain-based verification for document integrity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">4. Your Rights Under POPIA</h2>
            <p>Under the Protection of Personal Information Act, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access your personal information</li>
              <li>Correct or update inaccurate information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Object to processing in certain circumstances</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">5. Data Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Insurance companies and adjusters</li>
              <li>Legal and regulatory authorities when required</li>
              <li>Service providers under strict confidentiality agreements</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy and to comply with legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-on-dark-primary mb-3">7. Contact Our Data Protection Officer</h2>
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <p><strong>Data Protection Officer</strong></p>
              <p>Detachd Pty Ltd</p>
              <p>Enterprise Number: 2021/792488/07</p>
              <p>Cape Town, South Africa</p>
              <p>Email: privacy@detachd.systems</p>
              <p>Phone: +27 21 000 0000</p>
            </div>
          </section>
        </div>
      </PixelCard>
    </div>
  );
}; 