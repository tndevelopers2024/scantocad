import React, { useState } from 'react';
import { login, forgotPassword, resetPassword } from '../api';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/img/logo/new-logo.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | forgot | verify
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userRole', response.role);

        navigate(response.role === 'admin' ? '/app/admin/dashboard' : '/app/my-quotations');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const status = err.response?.status;
      const backendMessage = err.response?.data?.error || err.response?.data?.message;

      if (status === 401) {
        setError(backendMessage || 'Incorrect email or password.');
      } else if (status === 403) {
        setError(backendMessage || 'Your account is not verified yet. Please check your email.');
      } else if (status === 404) {
        setError(backendMessage || 'User not found. Please register.');
      } else if (status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(backendMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    setError('');
    setForgotMessage('');
    setForgotLoading(true);

    try {
      await forgotPassword(resetEmail);
      setMode('verify');
      setForgotMessage('OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    setError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      await resetPassword({ email: resetEmail, otp, newPassword });
      setMode('login');
      setOtp('');
      setNewPassword('');
      setResetMessage('Password reset successful. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 relative">
        <div className="absolute bottom-0 left-0 mb-16 ml-16 w-64 h-64 border-2 border-blue-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 left-0 mb-32 ml-32 w-96 h-96 border-2 border-blue-300 rounded-full opacity-10"></div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-24">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <img src={logo} alt="Convertscantocad" className="mx-auto w-62" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {mode === 'login'
                ? 'Sign in!'
                : mode === 'forgot'
                ? 'Forgot Password'
                : 'Reset Password'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-md font-medium text-gray-700">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md pr-10"
                    placeholder="Enter password"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setResetEmail('');
                    setError('');
                    setForgotMessage('');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-4 rounded-md shadow-sm text-md font-medium text-white 
                  ${isLoading ? 'bg-blue-400' : 'bg-[#1C88ED] hover:bg-blue-700'}`}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <label className="block text-md font-medium text-gray-700">Enter your email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
              <button
                onClick={handleForgotSubmit}
                disabled={forgotLoading}
                className={`w-full py-3 rounded text-white font-medium ${
                  forgotLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              {forgotMessage && <p className="text-green-600 text-sm">{forgotMessage}</p>}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={() => setMode('login')}
                className="text-sm text-gray-600 hover:underline text-center w-full"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* RESET PASSWORD */}
          {mode === 'verify' && (
            <div className="space-y-4">
              <label className="block text-md font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="OTP"
              />
              <label className="block text-md font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="New Password"
              />
              <button
                onClick={handleResetSubmit}
                disabled={resetLoading}
                className={`w-full py-3 rounded text-white font-medium ${
                  resetLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={() => setMode('login')}
                className="text-sm text-gray-600 hover:underline text-center w-full"
              >
                Back to Login
              </button>
            </div>
          )}

          {mode === 'login' && (
            <p className="mt-6 text-center text-md text-gray-600">
              Don’t have an account?{' '}
              <a href="/app/register" className="text-[#1C88ED] hover:underline">
                Register Now
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
