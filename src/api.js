import axios from 'axios';

const BASE_URL = 'https://api.convertscantocad.com/api/v1';

export { 
  initializeSocket, 
  getSocket, 
  connectSocket, 
  disconnectSocket 
} from './socket';

export const register = async ({ name, email, password, phone, country, currency,role, company }) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name,
      email,
      password,
      phone,
      country,
      currency,
      role,
      company // should be an object with keys: name, address, website, industry, gstNumber
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  if (typeof token !== 'string') {
    throw new Error('Token must be a string');
  }

  try {
    const response = await axios.get(`${BASE_URL}/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error.response?.data || error.message);
    throw error;
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/resend-verification`, { email });
    return response.data;
  } catch (error) {
    console.error('Resend verification failed:', error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};



export const avaiableHour = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}/hours`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user avaiable hour:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

export const updateDetails = async (userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/auth/updatedetails`, userData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update details failed:', error);
    throw error;
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.put(`${BASE_URL}/auth/updatepassword`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update password failed:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/logout`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const requestQuote = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/quotations`, formData, {
      headers: {
        // Content-Type is automatically set to multipart/form-data when using FormData
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Request quote failed:', error);
    throw error; // Re-throw the error for handling in the component
  }
};



export const getQuotations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/quotations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching quotations failed:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

export const getUserQuotationById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/quotations/user/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching quotations failed:', error);
    throw error;
  }
};


export const getQuotationById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/quotations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching quotations failed:', error);
    throw error;
  }
};

export const raiseQuote = async (id, totalHours, files) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/quote`,
      { files, totalHours },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Raising quote failed:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteFile = async (id, fileId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/quotations/${id}/files/${fileId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Deleting file failed:', error.response?.data || error.message);
    throw error;
  }
};


export const updateEstimatedHours = async (id, files, totalHours = null) => {
  try {
    const payload = {
      files: files.map(file => ({
        fileId: file._id,
        requiredHour: file.requiredHour
      }))
    };

    if (totalHours !== null) {
      payload.totalHours = totalHours;
    }

    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/update-hour`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Updating estimated hours failed:', error);
    throw error;
  }
};


export const getQuotationsByuser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/quotations/my-quotations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching quotations failed:', error);
    throw error;
  }
};

// Get available credit hours for a user
export const getUserHours = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    const response = await axios.get(`${BASE_URL}/users/${userId}/hours`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log('getUserHours response.data →', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetching user hours failed:', error);
    throw error;
  }
};

// Update quote decision (approve or reject)
export const updateUserDecision = async (id, status) => {
  try {
    
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/decision`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Updating user decision failed:', error);
    throw error;
  }
};

export const updateUserDecisionPO = async (id, status) => {
  try {
    
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/decisionpo`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Updating user decision failed:', error);
    throw error;
  }
};

export const updateOngoing = async (id) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/ongoing`,
      {}, // Empty request body
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Updating Quotation ongoing failed:', error);
    throw error;
  }
};


export const completeQuotation = async (id, completedFiles, { onUploadProgress } = {}) => {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append all completed files
    if (Array.isArray(completedFiles)) {
      completedFiles.forEach((file, index) => {
        formData.append(`completedFiles`, file);
      });
    } else {
      formData.append(`completedFiles`, completedFiles);
    }

    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Completing quotation failed:', error);
    
    // Enhance the error object with custom messages
    const enhancedError = {
      ...error,
      userMessage: 'Failed to submit completed files',
      details: error.response?.data?.message || 
               (error.response?.status === 413 
                ? 'File size exceeds maximum limit' 
                : 'Network or server error')
    };
    
    throw enhancedError;
  }
};

export const rejectWithMessage = async (quotationId, payload) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${quotationId}/reject-with-message`,
      payload, // ✅ no stringify here
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Reject with message failed:', error.response?.data || error.message);
    throw error;
  }
};


export const deleteQuote = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/quotations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Request quote failed:', error);
    throw error; // Re-throw the error for handling in the component
  }
};

// api.js
export const updateQuote = async (formData, id) => {
  try {
    const response = await axios.put(`${BASE_URL}/quotations/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update quote failed:', error.response?.data || error.message);
    throw error;
  }
};




// Get all notifications for the logged-in user
export const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching notifications failed:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/notifications/${id}/read`, 
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Marking notification as read failed:', error);
    throw error;
  }
};

// Delete a notification
export const deleteUserNotification = async (id) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/notifications/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Deleting notification failed:', error);
    throw error;
  }
};

// Add this new function for updating PO status
export const updatePoStatus = async (quotationId, poStatus) => {
  try {
 

    const response = await axios.put(
      `${BASE_URL}/quotations/${quotationId}/po-status`,
      { poStatus },
      {
                headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Update PO status failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllRates = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/rateconfig`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get all rates:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch rates'
    };
  }
};

export const getCurrentRateByCountry = async (countryCode) => {
  try {
    const response = await axios.get(`${BASE_URL}/rateconfig/current/${countryCode}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get current rate:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch current rate'
    };
  }
};

export const updateRate = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/rateconfig/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update rate:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update rate'
    };
  }
};

export const createRate = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/rateconfig`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create rate:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create rate'
    };
  }
};

export const deleteRate = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/rateconfig/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete rate:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete rate'
    };
  }
};

export const reportQuotationIssues = async (quotationId, { fileReports = [], mainNote = '' }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/quotations/${quotationId}/report-issues`,
      { fileReports, mainNote },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Reporting quotation issues failed:', error);

    throw {
      ...error,
      userMessage: 'Failed to report issues. Please try again.',
      details: error.response?.data?.message || 'Server error',
    };
  }
};

export const uploadIssuedFiles = async (quotationId, filesToReupload, fileIds, { onUploadProgress } = {}) => {
  try {
    const formData = new FormData();

    // Convert files to array format with proper indices
    fileIds.forEach((fileId, index) => {
      if (filesToReupload[fileId]) {
        formData.append(`issuedFiles[${index}]`, filesToReupload[fileId]);
      }
    });

    // Add metadata about which files are being replaced
    formData.append('fileIds', JSON.stringify(fileIds));

    const response = await axios.post(
      `${BASE_URL}/quotations/${quotationId}/upload-issued-files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Uploading issued files failed:', error);
    
    // Extract meaningful error message
    let userMessage = 'Failed to upload replacement files';
    let details = '';
    
    if (error.response) {
      userMessage = error.response.data?.message || userMessage;
      details = error.response.data?.details || 
               `Server responded with ${error.response.status}`;
    }

    throw {
      ...error,
      userMessage,
      details,
    };
  }
};