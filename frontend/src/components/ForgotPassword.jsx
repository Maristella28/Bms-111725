import { useState } from 'react';
import { FaEye, FaEyeSlash, FaArrowLeft, FaEnvelope, FaShieldAlt, FaClock } from 'react-icons/fa';

export default function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  
  // Handle back to previous step
  const handleBackToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setStatus('');
      setIsSuccess(false);
      
      // Clear data based on step
      if (step === 3) {
        // Going back from password step to code step
        setNewPassword('');
        setConfirmPassword('');
      } else if (step === 2) {
        // Going back from code step to email step
        setResetCode('');
        setUserId(null);
        setUserEmail('');
        setCodeExpiresAt(null);
      }
    }
  };

  // Handle start over
  const handleStartOver = async () => {
    setIsLoading(true);
    setStatus('');
    
    // Clear existing reset code if we have an email
    if (email) {
      try {
        const response = await fetch('/api/clear-password-reset-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          setStatus('Existing reset code cleared. You can now request a new one.');
          setIsSuccess(true);
        } else {
          setStatus('Reset code cleared. You can now request a new one.');
          setIsSuccess(true);
        }
      } catch (error) {
        console.error('Error clearing reset code:', error);
        setStatus('Reset code cleared. You can now request a new one.');
        setIsSuccess(true);
      }
    }
    
    // Reset all form data
    setStep(1);
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setUserId(null);
    setUserEmail('');
    setCodeExpiresAt(null);
    setIsLoading(false);
    
    // Clear status after a short delay
    setTimeout(() => {
      setStatus('');
      setIsSuccess(false);
    }, 3000);
  };

  // Password validation function (same as Register component)
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  };

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.user_id);
        setUserEmail(data.email);
        setCodeExpiresAt(data.code_expires_at);
        setStep(2);
        setStatus('Password reset code sent successfully! Please check your email.');
        setIsSuccess(true);
      } else {
        // Handle validation errors
        if (data.errors && data.errors.email) {
          setStatus(data.errors.email[0]);
        } else {
          setStatus(data.message || 'Failed to send reset code. Please try again.');
        }
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setStatus('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify-password-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId, 
          reset_code: resetCode 
        }),
      });

      const data = await response.json();

      if (response.ok && data.is_valid) {
        setStep(3);
        setStatus('Code verified successfully! Please enter your new password.');
        setIsSuccess(true);
      } else {
        setStatus(data.message || 'Invalid reset code. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setStatus('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match. Please try again.');
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setStatus('Password must meet all requirements. Please check the requirements below.');
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          reset_code: resetCode,
          password: newPassword,
          password_confirmation: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Password reset successfully! You can now log in with your new password.');
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        setStatus(data.message || 'Failed to reset password. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset code
  const handleResendCode = async () => {
    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/resend-password-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeExpiresAt(data.code_expires_at);
        setStatus('New reset code sent successfully! Please check your email.');
        setIsSuccess(true);
      } else {
        setStatus(data.message || 'Failed to resend code. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setStatus('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!codeExpiresAt) return '';
    const expires = new Date(codeExpiresAt);
    const now = new Date();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-25" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
          <circle cx="200" cy="150" r="100" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="150;450;150" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="300" r="120" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="300;100;300" dur="25s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="500" r="80" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="500;200;500" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <section className="flex items-center justify-center px-4 py-12 min-h-screen">
        <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
          {/* Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaShieldAlt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white text-center">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Enter Reset Code'}
              {step === 3 && 'Create New Password'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              {step === 1 && 'Enter your email address to receive a reset code'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a strong new password for your account'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Forms */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>

              {/* Always show start over option on step 1 */}
              <button
                type="button"
                onClick={handleStartOver}
                className="w-full bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 font-medium py-2 rounded-lg transition duration-150 ease-in-out"
              >
                Clear Existing Code & Start Over
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Code sent to: {userEmail}
                </p>
                {codeExpiresAt && (
                  <div className="flex items-center justify-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                    <FaClock className="w-4 h-4 mr-1" />
                    Expires in: {getTimeRemaining()}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || resetCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={handleBackToPreviousStep}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition duration-150 ease-in-out"
              >
                Back to Email Step
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Password Requirements:</div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(newPassword).minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(newPassword).minLength ? '✓' : '✗'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(newPassword).hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(newPassword).hasUppercase ? '✓' : '✗'}</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(newPassword).hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(newPassword).hasLowercase ? '✓' : '✗'}</span>
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(newPassword).hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(newPassword).hasNumber ? '✓' : '✗'}</span>
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(newPassword).hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(newPassword).hasSpecialChar ? '✓' : '✗'}</span>
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || newPassword !== confirmPassword || !validatePassword(newPassword).isValid}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={handleBackToPreviousStep}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition duration-150 ease-in-out"
              >
                Back to Code Step
              </button>
            </form>
          )}

          {/* Status Message */}
          {status && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status}
              
              {/* Show start over option for rate limiting errors */}
              {status.includes('already sent') && step === 1 && (
                <div className="mt-3">
                  <button
                    onClick={handleStartOver}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                  >
                    Clear Code & Start Over
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="text-center space-y-2">
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition duration-150 ease-in-out"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
            
            {step > 1 && (
              <div>
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-medium transition duration-150 ease-in-out"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
