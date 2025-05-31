import React, { useState } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Phone, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow sending verification code
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          setError('reCAPTCHA has expired. Please refresh the page.');
        }
      });
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      setupRecaptcha();
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, (window as any).recaptchaVerifier);
      setVerificationId(confirmation);
      setLoading(false);
    } catch (error) {
      console.error('Error sending code:', error);
      setError('Error sending verification code. Please check your phone number and try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationId) {
      setError('Please request a verification code first.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await verificationId.confirm(verificationCode);
      // Update user profile with name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <UserPlus size={30} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to get started with Leads Manager</p>
          </div>
          
          {!verificationId ? (
            <form onSubmit={handleSendVerificationCode} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="pl-10 block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter your phone number with country code</p>
              </div>
              
              <div id="recaptcha-container" className="flex justify-center"></div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to your phone</p>
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying...' : 'Complete Sign Up'}
                <ArrowRight size={18} className="ml-2" />
              </button>
              
              <button
                type="button"
                onClick={() => setVerificationId(null)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition"
              >
                Change information
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-800 transition">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;