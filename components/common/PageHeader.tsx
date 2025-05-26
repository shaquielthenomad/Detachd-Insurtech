import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ChevronLeftIcon } from './Icon';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  actions?: React.ReactNode; 
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonPath,
  actions,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1); 
    }
  };

  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack} 
              className="mr-3 p-1 rounded-full hover:bg-slate-700" // dark gray hover for dark theme
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-6 w-6 text-text-on-dark-secondary" /> {/* gray icon for dark theme */}
            </Button>
          )}
          <h1 className="text-2xl font-bold leading-7 text-text-on-dark-primary sm:text-3xl sm:truncate"> {/* white title for dark theme */}
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className={`mt-1 text-sm text-text-on-dark-secondary ${showBackButton ? 'ml-12 md:ml-10' : ''}`}> {/* gray subtitle for dark theme */}
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="mt-4 flex md:mt-0 md:ml-4">{actions}</div>}
    </div>
  );
};