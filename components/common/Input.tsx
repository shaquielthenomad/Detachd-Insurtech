
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  error, 
  className = '', 
  leftIcon, 
  rightIcon, 
  containerClassName = '',
  ...props 
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-dim mb-1"> {/* text-dim is medium gray */}
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(leftIcon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-text-dim' })}
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full px-3 py-2 border border-input-border bg-input-bg text-text-light rounded-md shadow-sm placeholder-text-dim focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary focus:border-primary'} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
             {React.cloneElement(rightIcon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-text-dim' })}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
