import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LockIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '../common/Icon';

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export const UpdatePasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): PasswordStrength => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    const feedback: string[] = [];

    if (!checks.length) feedback.push('At least 8 characters');
    if (!checks.uppercase) feedback.push('One uppercase letter');
    if (!checks.lowercase) feedback.push('One lowercase letter');
    if (!checks.numbers) feedback.push('One number');
    if (!checks.special) feedback.push('One special character');

    return {
      score,
      feedback,
      isValid: score === 5
    };
  };

  const passwordStrength = validatePassword(formData.newPassword);

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!passwordStrength.isValid) {
      newErrors.newPassword = 'Password does not meet requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({ submit: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Update Password" 
        subtitle="Change your account password for security"
        showBackButton={true}
        backButtonPath="/settings"
      />

      <div className="max-w-2xl">
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
            <span className="text-green-200">Password updated successfully!</span>
          </div>
        )}

        <PixelCard 
          variant="blue" 
          title="Change Password" 
          icon={<LockIcon className="h-5 w-5 text-blue-400" />}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              leftIcon={<LockIcon className="h-5 w-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              }
              required
            />

            {/* New Password */}
            <div>
              <Input
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                leftIcon={<LockIcon className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                }
                required
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Password Strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-400' :
                      passwordStrength.score <= 3 ? 'text-yellow-400' :
                      passwordStrength.score <= 4 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <div className="space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-400">
                          <XCircleIcon className="h-4 w-4 text-red-400 mr-2" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {passwordStrength.isValid && (
                    <div className="flex items-center text-sm text-green-400">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      All requirements met
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<LockIcon className="h-5 w-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              }
              required
            />

            {errors.submit && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!passwordStrength.isValid || formData.newPassword !== formData.confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </PixelCard>

        {/* Security Tips */}
        <PixelCard variant="default" title="Security Tips" className="mt-6">
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span>Use a unique password that you don't use for other accounts</span>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span>Consider using a password manager to generate and store strong passwords</span>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span>Enable two-factor authentication for additional security</span>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}; 