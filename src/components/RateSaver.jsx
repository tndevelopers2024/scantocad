import React, { useEffect, useState } from 'react';
import { getAllRates, updateRate } from '../api';

const RateSaver = () => {
  const [rates, setRates] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchAndStoreRate = async () => {
      try {
        const allRates = await getAllRates();

        if (!Array.isArray(allRates) || allRates.length === 0) {
          setStatus('No rates found');
          return;
        }

        setRates(allRates);

        const selectedRate = allRates[0]; // You can change this logic
        setCurrentRate(selectedRate);

        // Save to localStorage
        localStorage.setItem('ACTIVE_RATE', JSON.stringify(selectedRate));

        // Update rate via API
        await updateRate(selectedRate.id, selectedRate);

        setStatus('Rate saved and updated successfully');
      } catch (error) {
        console.error('Error fetching or updating rates:', error);
        setStatus('Failed to load or update rates');
      }
    };

    fetchAndStoreRate();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Rate Saver</h1>
      <p>{status}</p>

      {currentRate ? (
        <div>
          <h2>Current Rate</h2>
          <pre>{JSON.stringify(currentRate, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading rates...</p>
      )}
    </div>
  );
};

export default RateSaver;
