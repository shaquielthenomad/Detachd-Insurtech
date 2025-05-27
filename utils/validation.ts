// Validation utilities for Detachd platform
// Provides secure input validation and sanitization

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation using RFC 5322 compliant regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
};

// Phone number validation (South African format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// XSS protection - sanitize HTML input
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// SQL injection protection - escape special characters
export const sanitizeSQL = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
};

// Name validation
export const isValidName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  if (name.trim().length > 100) return false;
  
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name.trim());
};

// ID number validation (South African)
export const isValidSAIdNumber = (idNumber: string): boolean => {
  const id = idNumber.replace(/\s+/g, '');
  
  // Must be 13 digits
  if (!/^\d{13}$/.test(id)) return false;
  
  // Luhn algorithm validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(id[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(id[12]);
};

// Login form validation
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Registration form validation
export const validateRegistrationForm = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Name validation
  if (!formData.name) {
    errors.name = 'Full name is required';
  } else if (!isValidName(formData.name)) {
    errors.name = 'Please enter a valid name';
  }
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }
  
  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Phone validation (optional)
  if (formData.phone && !isValidPhoneNumber(formData.phone)) {
    errors.phone = 'Please enter a valid South African phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Contact form validation
export const validateContactForm = (formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
}): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  if (!formData.name || !isValidName(formData.name)) {
    errors.name = 'Please enter a valid name';
  }
  
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !isValidPhoneNumber(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (!formData.subject || formData.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters';
  }
  
  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }
  
  if (!formData.category) {
    errors.category = 'Please select a category';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// File validation
export const validateFile = (file: File, options?: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}): FileValidationResult => {
  const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/quicktime'
  ];
  
  // Size validation
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
    };
  }
  
  // Type validation
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }
  
  // File name validation (prevent path traversal)
  if (/[<>:"|?*]/.test(file.name) || file.name.includes('..')) {
    return {
      isValid: false,
      error: 'Invalid file name'
    };
  }
  
  return { isValid: true };
};

// Claim form validation
export const validateClaimForm = (formData: {
  fullName: string;
  policyNumber: string;
  claimType: string;
  dateOfLoss: string;
  incidentDescription: string;
  estimatedAmount: string;
  location: string;
}): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  if (!formData.fullName || !isValidName(formData.fullName)) {
    errors.fullName = 'Please enter a valid full name';
  }
  
  if (!formData.policyNumber || formData.policyNumber.trim().length < 5) {
    errors.policyNumber = 'Policy number must be at least 5 characters';
  }
  
  if (!formData.claimType) {
    errors.claimType = 'Please select a claim type';
  }
  
  if (!formData.dateOfLoss) {
    errors.dateOfLoss = 'Date of loss is required';
  } else {
    const lossDate = new Date(formData.dateOfLoss);
    const today = new Date();
    if (lossDate > today) {
      errors.dateOfLoss = 'Date of loss cannot be in the future';
    }
  }
  
  if (!formData.incidentDescription || formData.incidentDescription.trim().length < 20) {
    errors.incidentDescription = 'Incident description must be at least 20 characters';
  }
  
  if (!formData.estimatedAmount || isNaN(Number(formData.estimatedAmount)) || Number(formData.estimatedAmount) <= 0) {
    errors.estimatedAmount = 'Please enter a valid estimated amount';
  }
  
  if (!formData.location || formData.location.trim().length < 5) {
    errors.location = 'Please provide a detailed location';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize form data
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeHtml(sanitized[key]);
    }
  });
  
  return sanitized;
};

// Rate limiting helper
export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]') as number[];
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return false; // Rate limited
  }
  
  // Add current attempt
  validAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
  
  return true; // Not rate limited
};

// Clear rate limit (for successful operations)
export const clearRateLimit = (key: string): void => {
  localStorage.removeItem(`rate_limit_${key}`);
}; 