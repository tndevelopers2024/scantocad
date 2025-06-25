import React, { useEffect, useState } from 'react';
import { getMe, updateDetails } from '../../api';
import { 
  FaUser, FaEnvelope, FaPhone, FaClock, 
  FaBuilding, FaIndustry, FaMapMarkerAlt, 
  FaGlobe, FaSave, FaSpinner, FaLock 
} from 'react-icons/fa';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    Hours: '',
    company: {
      name: '',
      address: '',
      website: '',
      industry: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        const user = res.data;

        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'user',
          Hours: user.Hours || '',
          company: user.company || {
            name: '',
            address: '',
            website: '',
            industry: ''
          }
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('company.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          [key]: value
        }
      }));
    } else if (name !== 'Hours') { // Prevent changes to Hours field
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateDetails(formData);
      setMessage(res.message || 'Your changes have been saved successfully!');
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Account Settings</h2>
          <p className="opacity-90 mt-1">Manage your profile and company information</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Status Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r flex items-start">
              <FiCheckCircle className="mt-0.5 mr-3 flex-shrink-0 text-green-500" />
              <div>{message}</div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-start">
              <FiAlertCircle className="mt-0.5 mr-3 flex-shrink-0 text-red-500" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Full Name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  icon={<FaUser className="text-gray-400" />}
                />
                <InputField 
                  label="Email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  type="email" 
                  icon={<FaEnvelope className="text-gray-400" />}
                />
                <InputField 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  icon={<FaPhone className="text-gray-400" />}
                />
                <div>
                  <label htmlFor="Hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Available hours
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="Hours"
                      name="Hours"
                      value={formData.Hours}
                      readOnly
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                  </div>
                </div>
               
              </div>
            </div>

            {/* Company Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FaBuilding className="mr-2 text-blue-500" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Company Name" 
                  name="company.name" 
                  value={formData.company.name} 
                  onChange={handleChange} 
                  icon={<FaBuilding className="text-gray-400" />}
                />
                <InputField 
                  label="Industry" 
                  name="company.industry" 
                  value={formData.company.industry} 
                  onChange={handleChange} 
                  icon={<FaIndustry className="text-gray-400" />}
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Address" 
                    name="company.address" 
                    value={formData.company.address} 
                    onChange={handleChange} 
                    icon={<FaMapMarkerAlt className="text-gray-400" />}
                  />
                </div>
                <InputField 
                  label="Website" 
                  name="company.website" 
                  value={formData.company.website} 
                  onChange={handleChange} 
                  icon={<FaGlobe className="text-gray-400" />}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SettingsPage;