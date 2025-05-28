import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate } from 'react-router-dom'; 
import logo from '../../public/img/logo/logo1.png'; 

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
const navigate = useNavigate(); 

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyGst, setCompanyGst] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords don't match");
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const response = await register({
        name,
        email,
        password,
        phone: mobileNumber,
        role,
        company: {
          name: companyName,
          address: companyAddress,
          website: companyWebsite,
          industry: companyIndustry,
          gstNumber: companyGst
        }
      });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        console.log('Registration successful:', response);
         navigate('/how-it-works');
      } else {
        console.error('Registration failed:', response);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Decorative */}
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative hidden lg:block">
        <div className="absolute top-1/3 left-10 w-72 h-72 border-4 border-blue-400 rounded-full opacity-30"></div>
        <div className="absolute top-1/4 left-32 w-48 h-48 border-2 border-blue-300 rounded-full opacity-20"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="mb-2" />
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Create an account</h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="flex gap-4">
              <input
                type="text"
                required
                placeholder="First name"
                className="w-1/2 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="Last name"
                className="w-1/2 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>

            {/* Email & Phone */}
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="tel"
              required
              placeholder="Mobile number"
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
            />

            {/* Password */}
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            {/* Role */}
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="client">Client</option>
            </select>

            {/* Company Section */}
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Company Details ( Optional )</h2>
              <input
                type="text"
                placeholder="Company name"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Address"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
              />
              <input
                type="url"
                placeholder="Website"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                value={companyWebsite}
                onChange={e => setCompanyWebsite(e.target.value)}
              />
              <input
                type="text"
                placeholder="Industry"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
                value={companyIndustry}
                onChange={e => setCompanyIndustry(e.target.value)}
              />
              <input
                type="text"
                placeholder="GST Number"
                className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={companyGst}
                onChange={e => setCompanyGst(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Register Now
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
