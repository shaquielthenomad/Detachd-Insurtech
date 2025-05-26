import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string; 
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  error, 
  options, 
  className = '', 
  containerClassName = '',
  placeholder, 
  ...rest 
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-dim mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full pl-3 pr-10 py-2 text-base border-input-border bg-input-bg text-text-light focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm rounded-md ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary focus:border-primary'} ${className}`}
        defaultValue={placeholder && !rest.value ? "" : rest.defaultValue} 
        {...rest} 
      >
        {placeholder && <option value="" disabled className="text-text-dim">{placeholder}</option>} 
        {options.map(option => (
          <option key={option.value} value={option.value} className="text-text-light bg-card-bg"> {/* Ensure options are readable */}
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};