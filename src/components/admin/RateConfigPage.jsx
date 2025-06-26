import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaSave, FaTimes, FaHistory, 
  FaMoneyBillWave, FaSearch, FaFilter, FaPlus,
  FaGlobeAmericas, FaTrash
} from 'react-icons/fa';
import { 
  getAllRates, 
  updateRate, 
  createRate,
  deleteRate,
  getCurrentRateByCountry 
} from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getConsistentCountries,
  getCountryName,
  getCountryCurrency
} from '../../contexts/countryUtils';

const RateConfigPage = ({ user }) => {
  const [allRates, setAllRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const [formData, setFormData] = useState({
  ratePerHour: '',
  country: 'US',  
  isActive: true
});
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCountries, setAllCountries] = useState(getConsistentCountries());

  const navigate = useNavigate();

  useEffect(() => {
    // Initialize countries
    setAllCountries(getConsistentCountries());
    fetchRates();
  }, [user, navigate]);

  useEffect(() => {
    filterRates();
  }, [allRates, searchTerm, filterActive]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRates();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch rates');
      }
      
      setAllRates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch rates:', err);
      setError(err.message || 'Failed to load rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterRates = () => {
    let results = allRates;
    
    if (searchTerm) {
      results = results.filter(rate => 
        rate.ratePerHour.toString().includes(searchTerm) ||
        getCountryName(rate.country).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterActive !== 'all') {
      const activeFilter = filterActive === 'active';
      results = results.filter(rate => rate.isActive === activeFilter);
    }
    
    setFilteredRates(results);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      country: 'US',
      isActive: true
    });
    setCreateMode(true);
    setEditMode(false);
    setEditingId(null);
    setError(null);
  };

  const handleEdit = (rate) => {
    setFormData({
      ratePerHour: rate.ratePerHour,
      country: rate.country,
      isActive: rate.isActive
    });
    setEditMode(true);
    setCreateMode(false);
    setEditingId(rate._id);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
  };

  const handleCancelCreate = () => {
    setCreateMode(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        setIsSubmitting(true);
        const response = await deleteRate(id);
        if (response.success) {
          await fetchRates();
          setSuccessMessage('Rate deleted successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          throw new Error(response.message || 'Failed to delete rate');
        }
      } catch (err) {
        setError(err.message || 'Failed to delete rate');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const validateForm = () => {
    if (!formData.ratePerHour || parseFloat(formData.ratePerHour) <= 0) {
      setError('Rate must be a positive number');
      return false;
    }
    if (!formData.country) {
      setError('Country is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      if (formData.isActive) {
        await updateRate(
          { country: formData.country, _id: { $ne: editingId } },
          { isActive: false }
        );
      }

      const response = await updateRate(editingId, formData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update rate');
      }

      await fetchRates();
      setSuccessMessage('Rate updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditMode(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update rate:', err);
      setError(err.message || 'Failed to update rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      if (formData.isActive) {
        await updateRate(
          { country: formData.country },
          { isActive: false }
        );
      }

      const response = await createRate(formData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create rate');
      }

      await fetchRates();
      setSuccessMessage('Rate created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setCreateMode(false);
    } catch (err) {
      console.error('Failed to create rate:', err);
      setError(err.message || 'Failed to create rate');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-gray-600 mt-2">Manage country-specific rates in USD</p>
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  disabled={editMode || createMode || isSubmitting}
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (USD)</th>
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
  <div className="flex items-center gap-2">
    <FaGlobeAmericas className="text-gray-400" />
    {getCountryName(rate.country)}
  </div>
</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${rate.ratePerHour.toFixed(2)}/hour
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
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(rate)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              disabled={createMode || isSubmitting}
                            >
                              <FaEdit className="inline" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(rate._id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              disabled={isSubmitting}
                            >
                              <FaTrash className="inline" />
                            </button>
                          </div>
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

        {(editMode || createMode) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mt-6"
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
                    Rate Per Hour (USD)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="ratePerHour"
                      name="ratePerHour"
                      value={formData.ratePerHour}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      step="1"
                      min="1"
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">/hour</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                 <select
  id="country"
  name="country"
  value={formData.country}
  onChange={handleInputChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  disabled={editMode || isSubmitting}
  required
>
  {allCountries.map((country) => (
    <option 
      key={country.alpha2}
      value={country.alpha2}
    >
      {country.name}
    </option>
  ))}
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
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Set as active rate for this country
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <FaSave /> {editMode ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={editMode ? handleCancelEdit : handleCancelCreate}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    disabled={isSubmitting}
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
  );
};

export default RateConfigPage;