import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import EmailVerification from '../components/EmailVerification';
import ForgotPassword from '../components/ForgotPassword';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // OPTIMIZATION: Add loading state
  const { login } = useAuth();
  const navigate = useNavigate();

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState(null);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);
    setIsLoggingIn(true); // OPTIMIZATION: Set loading state

    try {
      const userData = await login(email, password);

      setStatus('Login successful! Redirecting...');
      setIsSuccess(true);

      // Use the user data returned from login function
      const { role, has_logged_in } = userData;
      
      console.log('Login successful, user data:', userData);
      console.log('User role:', role);

      // For residents, check residency verification status (optimized)
      if (role === 'residents') {
        // Use user data from login response if available, otherwise fetch profile
        const profileData = userData.profile || userData;
        const verificationStatus = profileData?.verification_status;
        const profileCompleted = profileData?.profile_completed;

        console.log('🔍 Resident Login - Redirect Logic:');
        console.log('  - Verification Status:', verificationStatus);
        console.log('  - Profile Completed:', profileCompleted);
        console.log('  - Has Verification Image:', !!profileData?.residency_verification_image);

        // If no verification image uploaded
        if (!profileData?.residency_verification_image) {
          console.log('➡️ Redirecting to Profile: No verification image uploaded');
          navigate('/residents/profile');
          return;
        }

        // If verification is pending
        if (verificationStatus === 'pending') {
          console.log('➡️ Redirecting to Profile: Verification pending');
          navigate('/residents/profile');
          return;
        }

        // If verification is denied → show message and redirect
        if (verificationStatus === 'denied') {
          console.log('➡️ Redirecting to Profile: Verification denied');
          setStatus('Your residency verification was denied. Please re-upload a valid image.');
          setIsSuccess(false);
          setTimeout(() => {
            navigate('/residents/profile');
          }, 1500); // Reduced delay
          return;
        }
        
        // If verification is approved but profile is not completed → go to profile
        if (verificationStatus === 'approved' && !profileCompleted) {
          console.log('➡️ Redirecting to Profile: Verified but profile not completed');
          navigate('/residents/profile');
          return;
        }

        // If verification is approved AND profile is completed → go to dashboard
        if (verificationStatus === 'approved' && profileCompleted) {
          console.log('✅ Redirecting to Dashboard: Verified and profile completed!');
          navigate('/residents/dashboard');
          return;
        }

        // Fallback: go to profile for any other case
        console.log('➡️ Redirecting to Profile: Fallback case');
        navigate('/residents/profile');
        return;
      }

      // Redirect based on role for non-residents (immediate redirect)
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'treasurer':
          navigate('/treasurer/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          console.log('Unknown role, redirecting to dashboard');
          navigate(`/${role}/dashboard`);
      }

    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.requires_verification) {
        setVerificationUserId(err.response.data.user_id);
        setVerificationEmail(email);
        setShowVerification(true);
        setStatus('');
        return;
      }
      setStatus(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false); // OPTIMIZATION: Clear loading state
    }
  };

  // Handle verification success
  const handleVerificationSuccess = (data) => {
    setStatus('Email verified! Logging you in...');
    setIsSuccess(true);
    // Immediate redirect instead of delay
    setTimeout(() => {
      window.location.reload();
    }, 500); // Reduced delay
  };

  // Handle verification resend
  const handleVerificationResend = (data) => {
    setStatus('Verification code resent! Check your email.');
    setIsSuccess(true);
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setShowVerification(false);
    setVerificationUserId(null);
    setVerificationEmail('');
    setStatus('');
    setIsSuccess(false);
  };

  // Handle forgot password success
  const handleForgotPasswordSuccess = () => {
    setShowForgotPassword(false);
    setStatus('Password reset successfully! You can now log in with your new password.');
    setIsSuccess(true);
  };

  // Handle back from forgot password
  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
    setStatus('');
    setIsSuccess(false);
  };

  // UI for verification
  if (showVerification) {
    return (
      <EmailVerification
        email={verificationEmail}
        userId={verificationUserId}
        onVerify={handleVerificationSuccess}
        onResend={handleVerificationResend}
        onBack={handleBackToLogin}
        title="Email Verification Required"
        subtitle="Enter the 6-digit code sent to your email"
        backButtonText="Back to Login"
        verifyButtonText="Verify & Login"
        resendButtonText="Resend Verification Code"
      />
    );
  }

  // UI for forgot password
  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={handleBackFromForgotPassword}
        onSuccess={handleForgotPasswordSuccess}
      />
    );
  }

  // Normal login UI
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
          <div className="flex flex-col items-center space-y-3">
            <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center leading-tight tracking-wide">
              Barangay e-Governance
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {status && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                Register here
              </a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline"
              >
                Reset it here
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
