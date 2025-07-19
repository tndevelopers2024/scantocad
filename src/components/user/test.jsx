import React, { useState } from 'react';

function PurchaseOrderUploadForm() {
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('purchaseOrder', e.target.purchaseOrder.files[0]);
    formData.append('amount', amount);
    formData.append('hours', hours);

    const yourAuthToken = localStorage.getItem('token'); // Replace with your actual token retrieval logic

    try {
      const response = await fetch(
        'https://api.convertscantocad.com/api/v1/payments/upload-po',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${yourAuthToken}`,
            
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="file"
        name="purchaseOrder"
        accept="application/pdf"
        required
      />
      <input
        type="number"
        name="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="number"
        name="hours"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
}

export default PurchaseOrderUploadForm;
