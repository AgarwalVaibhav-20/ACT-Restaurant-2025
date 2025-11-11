// OTP Verification Page (Currently disabled)
// This component is not used while OTP is disabled

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft } from 'lucide-react';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyOtp, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect to signup if no email provided
  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await verifyOtp({ email, otp });
      if (response.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-brand-600" />
          <h1 className="mt-4 font-[var(--font-display)] text-3xl font-bold text-stone-900">
            Verify Your Email
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <div className="card p-8 space-y-6">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              OTP verification is currently disabled. You can proceed directly to the dashboard.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-stone-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (error) clearError();
                }}
                maxLength="6"
                disabled // Disabled since OTP is not active
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full btn btn-primary justify-center"
            >
              Continue to Dashboard (OTP Skipped)
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-stone-600">
              Didn't receive the code?{' '}
              <button className="font-medium text-brand-600 hover:text-brand-500" disabled>
                Resend Code (Disabled)
              </button>
            </p>
            
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}