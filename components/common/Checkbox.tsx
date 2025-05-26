import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  id, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={`h-4 w-4 text-primary border-input-border rounded focus:ring-primary focus:ring-offset-light ${className}`}
          {...props}
        />
        <label htmlFor={checkboxId} className="ml-2 block text-sm text-text-dim"> {/* text-dim is medium gray */}
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};