import React, { useState } from 'react';
import { register } from '../api';

const ADMIN_PASSKEY = "admin123"; // Simple constant passkey (for development only)

const AdminRegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setphone] = useState('');
  const [role, setrole] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (adminPasskey !== ADMIN_PASSKEY) {
      setError("Invalid admin passkey");
      return;
    }

    const name = `${firstName} ${lastName}`;
    
    try {
      const response = await register(name, email, password, phone, role);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('isAdmin', 'true');
        console.log('Admin registration successful:', response);
        // Redirect to admin dashboard
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Admin registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-full mb-2"></div>
            <h2 className="text-xl font-semibold text-gray-800">Convertscanstocad</h2>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Admin Registration</h1>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  autoComplete="given-name" 
                  required
                  placeholder="First name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <input 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  autoComplete="family-name" 
                  required
                  placeholder="Last name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <input
                id="email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                id="phone" 
                name="phone" 
                type="tel" 
                autoComplete="tel" 
                required
                placeholder="Mobile number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                value={phone}
                onChange={(e) => setphone(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                id="adminPasskey" 
                name="adminPasskey" 
                type="password" 
                required
                placeholder="Admin passkey"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                value={adminPasskey}
                onChange={(e) => setAdminPasskey(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <input
                id="password" 
                name="password" 
                type="password" 
                autoComplete="new-password" 
                required
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <input
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                autoComplete="new-password" 
                required
                placeholder="Confirm password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
            >
              Register Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;