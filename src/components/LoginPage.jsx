import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import logo from '../../public/img/logo/logo1.png'; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await login(formData.email, formData.password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userRole', response.role);
        navigate(response.role === 'admin' ? '/admin/dashboard' : '/my-quotations');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Blue Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 relative">
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 mb-16 ml-16 w-64 h-64 border-2 border-blue-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 left-0 mb-32 ml-32 w-96 h-96 border-2 border-blue-300 rounded-full opacity-10"></div>
      </div>

      {/* Right Sign-in Card */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-24">
        <div className="max-w-md w-full space-y-6">
          {/* Logo & Title */}
          <div className="text-center">
            {/* Replace with your logo */}
            <img src={logo} alt="Convertscanstocad" className="mx-auto  w-auto" /> 
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in!
            </h2>
          </div>

          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email / Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-md font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-md font-medium text-gray-700">
                Password
              </label>
             <div className="relative">
  <input
    id="password"
    name="password"
    type={showPassword ? 'text' : 'password'}
    required
    value={formData.password}
    onChange={handleChange}
    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
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

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              {/* <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </a> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white 
                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1C88ED] hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-md text-gray-600">
            Don’t have an account?{' '}
            <a href="/register" className="text-[#1C88ED] hover:underline">
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
