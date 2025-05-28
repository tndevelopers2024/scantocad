import axios from 'axios';

const BASE_URL = 'https://5000-firebase-scantocadbackendgit-1747203690155.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev/api/v1';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error; // Re-throw the error for handling in the component
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
       headers: {
        // Content-Type is automatically set to multipart/form-data when using FormData
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error; // Re-throw the error for handling in the component
  }
};

// Update user details
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

// Update password
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

// Logout user
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

export const updateOngoing = async (id) => {
  try {
    
    const response = await axios.put(
      `${BASE_URL}/quotations/${id}/ongoing`,
      {
        headers: {
          'Content-Type': 'application/json',
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

// Notification API calls

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