import React from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { ShieldCheckIcon, ZapIcon, SearchIcon, CheckCircleIcon } from '../common/Icon';

export const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-blue-400" />,
      title: "AI-Powered Verification",
      description: "Advanced machine learning algorithms detect fraud and verify document authenticity in real-time."
    },
    {
      icon: <ZapIcon className="h-8 w-8 text-green-400" />,
      title: "Lightning Fast Processing",
      description: "Automated workflows reduce claim processing time from weeks to hours."
    },
    {
      icon: <SearchIcon className="h-8 w-8 text-purple-400" />,
      title: "Fraud Detection",
      description: "Sophisticated AI models identify suspicious patterns and flag potential fraudulent claims."
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8 text-orange-400" />,
      title: "Blockchain Security",
      description: "Immutable blockchain records ensure data integrity and provide transparent audit trails."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader 
        title="About Detachd" 
        subtitle="Revolutionizing insurance claims processing in South Africa"
        showBackButton 
      />
      
      <div className="space-y-8">
        <PixelCard variant="blue">
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-text-on-dark-primary mb-4">
              The Future of Insurance Claims
            </h2>
            <p className="text-lg text-text-on-dark-secondary max-w-3xl mx-auto leading-relaxed">
              Detachd is an AI-powered insurtech startup revolutionizing fraud prevention in South Africa's $40 billion insurance market, 
              tackling $500M–$1B in annual losses from fraudulent claims. Our mobile app enables insurers and policyholders to upload 
              claim images, verified in real-time by AI for tampering, and sealed with ECTA-compliant digital signatures. 
              Compliant with POPIA for data protection, Detachd streamlines claims processing, reduces fraud, and builds trust.
            </p>
          </div>
        </PixelCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <PixelCard key={index} variant="blue">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-on-dark-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-on-dark-secondary">
                    {feature.description}
                  </p>
                </div>
              </div>
            </PixelCard>
          ))}
        </div>

        <PixelCard variant="blue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-on-dark-primary mb-4">Our Mission</h3>
              <p className="text-text-on-dark-secondary mb-4">
                To democratize access to fair, transparent, and efficient insurance services 
                across South Africa through innovative technology solutions.
              </p>
              <p className="text-text-on-dark-secondary">
                We believe that every South African deserves quick, honest, and reliable 
                insurance claim processing, regardless of their location or background.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-text-on-dark-primary mb-4">Why Choose Detachd?</h3>
              <ul className="space-y-2 text-text-on-dark-secondary">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  POPIA compliant and FSB regulated
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  24/7 multilingual support
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  99.9% uptime guarantee
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  Bank-grade security
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  South African ownership
                </li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard variant="blue">
          <div className="text-center py-6">
            <h3 className="text-2xl font-semibold text-text-on-dark-primary mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-text-on-dark-secondary font-medium">Company Name</p>
                <p className="text-text-on-dark-primary">Detachd Pty Ltd</p>
              </div>
              <div>
                <p className="text-text-on-dark-secondary font-medium">Enterprise Number</p>
                <p className="text-text-on-dark-primary">2021/792488/07</p>
              </div>
              <div>
                <p className="text-text-on-dark-secondary font-medium">Founded</p>
                <p className="text-text-on-dark-primary">2021</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-text-on-dark-secondary">
                <strong>Head Office:</strong> Cape Town, South Africa<br/>
                <strong>Email:</strong> info@detachd.systems<br/>
                <strong>Phone:</strong> +27 21 000 0000
              </p>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}; 