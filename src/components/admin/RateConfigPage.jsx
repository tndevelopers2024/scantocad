import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaSave, FaTimes, FaHistory, 
  FaMoneyBillWave, FaSearch, FaFilter, FaPlus
} from 'react-icons/fa';
import { getAllRates, updateRate, createRate } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';

const RateConfigPage = ({ user }) => {
  const [allRates, setAllRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    ratePerHour: '',
    currency: 'USD',
    isActive: false
  });
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRates();
  }, [user, navigate]);

  useEffect(() => {
    filterRates();
  }, [allRates, searchTerm, filterActive]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await getAllRates();
      setAllRates(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch rates');
      setLoading(false);
    }
  };

  const filterRates = () => {
    let results = allRates;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(rate => 
        rate.ratePerHour.toString().includes(searchTerm) ||
        rate.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterActive !== 'all') {
      const activeFilter = filterActive === 'active';
      results = results.filter(rate => rate.isActive === activeFilter);
    }
    
    setFilteredRates(results);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterActive(e.target.value);
  };

  const handleCreateNew = () => {
    setFormData({
      ratePerHour: '',
      currency: 'USD',
      isActive: false
    });
    setCreateMode(true);
    setEditMode(false);
    setEditingId(null);
    setError(null);
  };

  const handleEdit = (rate) => {
    setFormData({
      ratePerHour: rate.ratePerHour,
      currency: rate.currency,
      isActive: rate.isActive
    });
    setEditMode(true);
    setCreateMode(false);
    setEditingId(rate._id);
    setError(null);
  };

  const handleCancelEdit = () => {
    setFormData({ ratePerHour: '', currency: 'USD', isActive: false });
    setEditMode(false);
    setEditingId(null);
  };

  const handleCancelCreate = () => {
    setFormData({ ratePerHour: '', currency: 'USD', isActive: false });
    setCreateMode(false);
  };

  const validateForm = () => {
    if (parseFloat(formData.ratePerHour) <= 0) {
      setError('Rate must be a positive number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // If setting one rate active, deactivate others
      if (formData.isActive) {
        const updateInactive = allRates
          .filter((r) => r._id !== editingId && r.isActive)
          .map((r) =>
            updateRate(r._id, { ...r, isActive: false })
          );
        await Promise.all(updateInactive);
      }

      await updateRate(editingId, formData);
      await fetchRates();
      setSuccessMessage('Rate updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to update rate');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // If setting one rate active, deactivate others
      if (formData.isActive) {
        const updateInactive = allRates
          .filter((r) => r.isActive)
          .map((r) =>
            updateRate(r._id, { ...r, isActive: false })
          );
        await Promise.all(updateInactive);
      }

      await createRate(formData);
      await fetchRates();
      setSuccessMessage('Rate created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setCreateMode(false);
    } catch (err) {
      setError(err.message || 'Failed to create rate');
    }
  };

  const activeRate = allRates.find((rate) => rate.isActive);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading rate configurations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading rates</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button 
                onClick={fetchRates}
                className="mt-3 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <FaMoneyBillWave className="text-blue-600" />
            <span>Rate Configuration</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage and configure your billing rates</p>
        </header>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow mb-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-blue-500" />
                  Rate History
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    disabled={editMode || createMode}
                  >
                    <FaPlus /> New Rate
                  </button>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search rates..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterActive}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {filteredRates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRates.map((rate) => (
                        <motion.tr 
                          key={rate._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className={rate.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rate.ratePerHour}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rate.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rate.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(rate)}
                              className="text-blue-600 hover:text-blue-900 mr-3 flex items-center gap-1"
                              disabled={createMode}
                            >
                              <FaEdit className="inline" /> Edit
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No rates found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search or filter' : 'No rates have been configured yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Active Rate</h2>
                {activeRate ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">
                        {activeRate.ratePerHour} {activeRate.currency}/hour
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-sm text-gray-500">
                        {new Date(activeRate.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No active rate configured</p>
                  </div>
                )}
              </div>
            </div>

            {(editMode || createMode) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {editMode ? 'Edit Rate' : 'Create New Rate'}
                  </h2>
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <form onSubmit={editMode ? handleSubmit : handleCreateSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="ratePerHour" className="block text-sm font-medium text-gray-700 mb-1">
                        Rate Per Hour
                      </label>
                      <input
                        type="number"
                        id="ratePerHour"
                        name="ratePerHour"
                        value={formData.ratePerHour}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                        Set as active rate
                      </label>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaSave /> {editMode ? 'Update' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={editMode ? handleCancelEdit : handleCancelCreate}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateConfigPage;