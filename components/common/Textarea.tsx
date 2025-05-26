import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  id, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-text-dim mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`block w-full px-3 py-2 border border-input-border bg-input-bg text-text-light rounded-md shadow-sm placeholder-text-dim focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary focus:border-primary'} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};