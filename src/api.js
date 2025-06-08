import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

export { 
  initializeSocket, 
  getSocket, 
  connectSocket, 
  disconnectSocket 
} from './socket';

export const register = async ({ name, email, password, phone, role, company }) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name,
      email,
      password,
      phone,
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

export const raiseQuote = async (id, requiredHour) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/quote`,
      { requiredHour },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Raising quote failed:', error);
    throw error;
  }
};

export const updateEstimatedHours = async (id, tempHours) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/update-hour/`,
      { requiredHour:tempHours },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Raising quote failed:', error);
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


export const completeQuotation = async (id, formData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Completing quotation failed:', error);
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

// Rate Config functions
export const getCurrentRate = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/rateconfig/current`, {
      headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get current rate:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllRates = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/rateconfig`, {
      headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get all rates:', error.response?.data || error.message);
    throw error;
  }
};

export const updateRate = async (id, rateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/rateconfig/${id}`, rateData, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update rate:', error.response?.data || error.message);
    throw error;
  }
};

export const createRate = async (rateData) => {
  try {
    const response = await axios.post(`${BASE_URL}/rateconfig`, rateData, {
      headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create rate:', error.response?.data || error.message);
    throw error;
  }
};