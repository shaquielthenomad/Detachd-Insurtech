import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"; // ring-offset-light is page bg (light gray)

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary', // primary is blue
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary', // secondary is slate
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-primary text-primary hover:bg-blue-50 focus:ring-primary', // Blue border/text
    ghost: 'text-primary hover:bg-blue-50 focus:ring-primary', // Blue text
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'primary' || variant === 'secondary' || variant === 'danger' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};