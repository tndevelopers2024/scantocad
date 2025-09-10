import React, { useState, useMemo } from 'react';
import { register, verifyEmail, resendVerification } from '../api';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/img/logo/new-logo.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  getConsistentCountries,
  getCountryName,
  getCountryCurrency
} from '../contexts/countryUtils';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConformPassword, setShowConfromPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const navigate = useNavigate();

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');

  // Get consistent country options
const countryOptions = useMemo(() => {
  return getConsistentCountries().map((country, index) => ({
    name: country.name,
    code: country.alpha2,
    currency: getCountryCurrency(country.alpha2),
    // Add index to ensure unique key
    uniqueKey: `${country.alpha2}-${getCountryCurrency(country.alpha2)}-${index}`
  }));
}, []);

const handleRegister = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  if (password !== confirmPassword) {
    setError("Passwords don't match.");
    return;
  }

  if (!selectedCountry) {
    setError('Please select a country.');
    return;
  }

  const name = `${firstName.trim()} ${lastName.trim()}`.trim();

  try {
    setLoading(true);

    const userData = {
      name,
      email,
      password,
      phone: mobileNumber,
      role,
      country: selectedCountry.code,
      currency: selectedCountry.currency,
    };

    if (role === 'company') {
      userData.company = {
        name: companyName,
        address: companyAddress,
        website: companyWebsite,
        industry: companyIndustry,
      };
    }

    const response = await register(userData);

    if (response.success) {
      setMessage('Verification email sent. Please check your inbox.');
      setStep(2);
    } else {
      setError(response.error || 'Registration failed. Please try again.');
    }
  } catch (err) {
    const status = err.response?.status;
    const backendError = err.response?.data?.error || err.response?.data?.message;

    if (status === 409) {
      setError(backendError || 'User already exists. Please sign in.');
    } else if (status === 400) {
      setError(backendError || 'Invalid form data. Please check your inputs.');
    } else {
      setError(backendError || 'Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};



  const handleVerify = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  try {
    setLoading(true);
    const response = await verifyEmail(otp);

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userRole', response.user.role);
      setStep(3);
    } else {
      setError(response.error || 'Verification failed. Invalid OTP.');
    }
  } catch (err) {
    const msg = err.response?.data?.message;
    const code = err.response?.status;

    if (code === 401) {
      setError(msg || 'Invalid or expired OTP. Please try again.');
    } else {
      setError(msg || 'Verification failed. Try again later.');
    }
  } finally {
    setLoading(false);
  }
};


 const handleResend = async () => {
  setError('');
  setMessage('');

  try {
    setLoading(true);
    const response = await resendVerification(email);

    if (response.success) {
      setMessage('New verification email sent.');
    } else {
      setError(response.error || 'Unable to resend verification email.');
    }
  } catch (err) {
    const code = err.response?.status;
    const msg = err.response?.data?.message;

    if (code === 404) {
      setError(msg || 'Email not found. Please register again.');
    } else if (code === 409) {
      setError(msg || 'Account already verified. You can log in now.');
    } else {
      setError(msg || 'Error sending verification email.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative hidden lg:block">
        <div className="absolute top-1/3 left-10 w-72 h-72 border-4 border-blue-400 rounded-full opacity-30"></div>
        <div className="absolute top-1/4 left-32 w-48 h-48 border-2 border-blue-300 rounded-full opacity-20"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="mb-2" />
            <h1 className="text-2xl font-bold text-gray-800 mt-4">
              {step === 1 ? 'Create an account' : 'Verify your email'}
            </h1>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  className="w-1/2 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  className="w-1/2 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <input
                type="email"
                required
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="w-full">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  placeholder="Enter phone number"
                  value={mobileNumber}
                  onChange={setMobileNumber}
                  className="phone-input focus:ring-2 focus:ring-blue-500 w-full px-4 py-3 border rounded-md"
                />
              </div>

          <select
  value={selectedCountry?.code || ''}
  onChange={(e) => {
    const selected = countryOptions.find(c => c.code === e.target.value);
    setSelectedCountry(selected);
  }}
  required
  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select Country</option>
  {countryOptions.map((country) => (
    <option key={country.uniqueKey} value={country.code}>
      {country.name} ({country.currency})
    </option>
  ))}
</select>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              <div className="relative">
                <input
                  type={showConformPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={() => setShowConfromPassword((prev) => !prev)}
                >
                  {showConformPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">Individual</option>
                <option value="company">Company</option>
                <option value="freelancer">Freelancer</option>
              </select>

              {role === 'company' && (
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-lg font-semibold mb-2">Company Details</h2>
                  <input
                    type="text"
                    required
                    placeholder="Company name"
                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Address"
                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="Website"
                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Industry"
                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Register Now'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <p className="mb-4">We've sent a verification code to {email}</p>
                <input
                  type="text"
                  required
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-green-700">Registration Successful!</h2>
              <p className="text-gray-600">Your email has been verified. You're all set to get started.</p>
              <button
                onClick={() => navigate('/app/how-it-works')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Let's Start!
              </button>
            </div>
          )}

          {step === 1 && (
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <a href="/app/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;