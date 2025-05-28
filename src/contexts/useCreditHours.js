import { useState, useEffect } from 'react';

const useCreditHours = () => {
  const [creditData, setCreditData] = useState({
    hours: 0,
    name: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchCreditHours = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          throw new Error('Authentication required');
        }

        const response = await fetch(
          `https://5000-firebase-scantocadbackendgit-1747203690155.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev/api/v1/users/${userId}/hours`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        
        if (!data || typeof data.hours !== 'number') {
          throw new Error('Invalid response format');
        }

        setCreditData({
          hours: data.hours,
          name: data.name || '',
          loading: false,
          error: null
        });

      } catch (err) {
        console.error('Error fetching credit hours:', err);
        setCreditData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };

    fetchCreditHours();
  }, []);

  return creditData;
};

export default useCreditHours;