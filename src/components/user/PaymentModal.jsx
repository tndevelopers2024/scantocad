  import React, { useState, useEffect } from 'react';
  import PropTypes from 'prop-types';
  import { countries } from 'country-data';
  import { 
    FiX, FiPlus, FiMinus, FiUpload, FiCheck, FiCreditCard, FiDollarSign,
    FiFileText, FiLoader, FiArrowRight, FiCheckCircle, FiAlertCircle, FiArrowLeft
  } from 'react-icons/fi';
  import { FaPaypal } from 'react-icons/fa';
  import { getCurrentRateByCountry, getMe } from '../../api';

  const StepPaymentModal = ({ 
    isOpen, 
    onClose, 
    onPaymentSuccess,
    onPOUploadSuccess,
    requiredHours = 1,
    quotationId,
  }) => {
    const [step, setStep] = useState(1);
    const [hours, setHours] = useState(requiredHours);
    const [activeGateway, setActiveGateway] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingScript, setLoadingScript] = useState(false);
    const [purchaseOrderFile, setPurchaseOrderFile] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [purchaseOrderStatus, setPurchaseOrderStatus] = useState(null);
    const backendBaseUrl = 'https://ardpgimerchd.org/api/v1/payments';
    const token = localStorage.getItem('token');
    const [ratePerHour, setRatePerHour] = useState(0);
    const [loadingRate, setLoadingRate] = useState(true);
    const [rateError, setRateError] = useState(null);
    const [userCountry, setUserCountry] = useState('US');
    const [countryName, setCountryName] = useState('United States');

    // Calculate total price
    const totalPrice = hours * ratePerHour;

    // File validation constants
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedFileTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpeg', '.jpg', '.png'];

    // Get country name from country code
    const getCountryName = (code) => {
      const country = countries[code.toUpperCase()];
      return country ? country.name : code;
    };

    // Reset state when modal closes
    useEffect(() => {
      if (!isOpen) {
        setStep(1);
        setHours(requiredHours);
        setActiveGateway(null);
        setPurchaseOrderFile(null);
        setFileError(null);
        setPurchaseOrderStatus(null);
      }
    }, [isOpen, requiredHours]);

    // Fetch user's country and appropriate rate
    useEffect(() => {
      const fetchUserCountryAndRate = async () => {
        if (isOpen) {
          try {
            setLoadingRate(true);
            setRateError(null);
            
            // Get user's country from API
            const userData = await getMe();
            const detectedCountry = userData?.data.country?.toUpperCase() || 'US';
            const countryDisplayName = getCountryName(detectedCountry);
            
            setUserCountry(detectedCountry);
            setCountryName(countryDisplayName);
            
            // Try to fetch rate for user's country
            try {
              const response = await getCurrentRateByCountry(detectedCountry);
              if (response.success && response.data) {
                setRatePerHour(response.data.ratePerHour);
                setLoadingRate(false);
                return;
              }
            } catch (error) {
              console.log(`No rate found for ${detectedCountry}, falling back to US`);
            }
            
            // Fall back to US rate if country rate not found
            const usResponse = await getCurrentRateByCountry('US');
            if (usResponse.success && usResponse.data) {
              setRatePerHour(usResponse.data.ratePerHour);
            } else {
              throw new Error('Failed to load default US rate');
            }
            
            setLoadingRate(false);
          } catch (error) {
            console.error('Failed to fetch rate:', error);
            setRateError(error.message || 'Failed to load pricing. Please try again later.');
            setLoadingRate(false);
            setRatePerHour(0);
          }
        }
      };

      fetchUserCountryAndRate();
    }, [isOpen]);

    const handleIncrement = () => setHours(prev => prev + 1);
    const handleDecrement = () => setHours(prev => (prev > 1 ? prev - 1 : 1));

    const loadScript = (src) => {
      setLoadingScript(true);
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          setLoadingScript(false);
          resolve();
        };
        script.onerror = () => {
          setLoadingScript(false);
          reject(new Error(`Script load error for ${src}`));
        };
        document.body.appendChild(script);
      });
    };

    const handlePaymentError = (error) => {
      console.error('Payment error:', error);
      alert(error.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    };

    const verifyPayment = async (gateway, verificationData) => {
      try {
        const verifyRes = await fetch(`${backendBaseUrl}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            gateway,
            amount: totalPrice,
            hours,
            quotationId,
            ...verificationData
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.message || "Payment verification failed");
        }
        onPaymentSuccess();
        setStep(3);
      } catch (error) {
        handlePaymentError(error);
      }
    };

    const validateFile = (file) => {
      setFileError(null);
      
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        setFileError('Invalid file type. Accepted formats: PDF, DOC, DOCX, JPEG, JPG, PNG');
        return false;
      }

      if (!allowedFileTypes.includes(file.type)) {
        setFileError('Invalid file type. Accepted formats: PDF, DOC, DOCX, JPEG, JPG, PNG');
        return false;
      }

      if (file.size > maxFileSize) {
        setFileError('File size exceeds 10MB limit');
        return false;
      }

      return true;
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (validateFile(file)) {
        setPurchaseOrderFile(file);
        setFileError(null);
      } else {
        setPurchaseOrderFile(null);
        e.target.value = '';
      }
    };

    const handlePurchaseOrderSubmit = async () => {
      if (!purchaseOrderFile) {
        setFileError('Please upload a purchase order file');
        return;
      }

      setIsProcessing(true);
      setPurchaseOrderStatus(null);

      try {
        const formData = new FormData();
        formData.append('file', purchaseOrderFile);
        formData.append('amount', totalPrice);
        formData.append('hours', hours);
        formData.append('quotationId', quotationId);
        formData.append('country', userCountry); // Send country code with PO
        
        const response = await fetch(`${backendBaseUrl}/purchase-order`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to submit purchase order");
        }
        
        setPurchaseOrderStatus('success');
        onPOUploadSuccess();
        setStep(3);
      } catch (error) {
        console.error('Purchase order submission error:', error);
        setPurchaseOrderStatus('error');
        handlePaymentError(error);
      } finally {
        setIsProcessing(false);
      }
    };

    const initializePaypal = async () => {
  if (!window.paypal) return;

  try {
    document.getElementById('paypal-button-container').innerHTML = '';
    
    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'paypal'
      },
      createOrder: async function() {
        const amountInCents = Math.round(totalPrice * 100); // Convert to cents
        console.log('Creating PayPal order for amount:', amountInCents);
        
        const orderRes = await fetch(`${backendBaseUrl}/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            amount: amountInCents,  // Send amount in cents
            hours, 
            quotationId,
            country: userCountry,
            gateway: 'paypal' 
          })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) throw new Error("Failed to create order");
        return orderData.order.id;
      },
      onApprove: async function(data) {
        await verifyPayment('paypal', {
          paypal_order_id: data.orderID
        });
      },
      onError: function(err) {
        handlePaymentError(err);
      }
    }).render('#paypal-button-container');
  } catch (err) {
    handlePaymentError(err);
  }
};

    useEffect(() => {
      if (activeGateway === 'paypal' && step === 2) {
        loadScript(`https://www.paypal.com/sdk/js?client-id=ASJQyCyGK6uKYaMMyOXb1wXXW1Q4OEcSJfxV_xYzXlccJZ-efkhFTtgim2mECDU4qZRtajbrkJBtqifY&currency=USD`)
          .then(() => initializePaypal())
          .catch(err => handlePaymentError(err));
      }
    }, [activeGateway, step]);

    if (!isOpen) return null;

    if (loadingRate) {
      return (
        <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto my-8"></div>
            <p className="text-gray-600">Loading pricing information...</p>
          </div>
        </div>
      );
    }

    if (rateError) {
      return (
        <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading rates</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{rateError}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative ">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-white-600"></div>
          
          <button
            onClick={onClose}
            className="absolute top-[-5px] right-[-5px] bg-[#2563eb] rounded-4xl text-white p-1 hover:text-black transition-colors"
            disabled={isProcessing}
          >
            <FiX size={24} />
          </button>

          <div className="flex justify-between mb-8 relative">
            {['Select Hours', 'Payment', 'Confirmation'].map((label, idx) => {
              const index = idx + 1;
              const isActive = step === index;
              const isCompleted = step > index;
              
              return (
                <div key={label} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                        : isCompleted
                          ? 'bg-green-100 text-green-600 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                    }`}
                  >
                    {isCompleted ? <FiCheck size={18} /> : index}
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ 
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-start">
                <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                <span>No available credit. You need {requiredHours} additional hours. To proceed, add {requiredHours} hours or submit a purchase order.</span>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Add credit hours</h3>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-l-lg hover:bg-gray-200 transition-colors"
                  onClick={handleDecrement}
                  disabled={isProcessing}
                >
                  <FiMinus />
                </button>
                <div className="w-30 px-4 py-3 border-t border-b border-gray-200 bg-gray-800 font-mono rounded-md mx-2 text-white text-center font-bold text-lg">
                  {hours} : 00
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-r-lg hover:bg-gray-200 transition-colors"
                  onClick={handleIncrement}
                  disabled={isProcessing}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="flex justify-center items-center gap-4 ">
                <div className=" p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-500 mb-1">Total price</div>
                  <div className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                    <FiDollarSign className="mr-1" /> {totalPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Rate for: {countryName}
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <div>
                  <label className="group">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
                        disabled={isProcessing}
                      />
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className="text-gray-400 group-hover:text-blue-500 mb-2 text-xl" />
                        <div className="font-medium text-gray-700">Upload Purchase Order</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {purchaseOrderFile ? (
                            <span className="text-green-600 flex items-center">
                              <FiCheck className="mr-1" /> {purchaseOrderFile.name}
                            </span>
                          ) : (
                            'PDF, DOC, JPG, PNG (Max 10MB)'
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  {fileError && (
                    <div className="text-red-500 text-sm text-center mt-2 flex items-center justify-center">
                      <FiAlertCircle className="mr-1" /> {fileError}
                    </div>
                  )}
                  
                  {purchaseOrderStatus === 'error' && (
                    <div className="text-red-500 text-sm text-center mt-2 flex items-center justify-center">
                      <FiAlertCircle className="mr-1" /> Failed to submit purchase order. Please try again.
                    </div>
                  )}
                  
                  <button
                    onClick={handlePurchaseOrderSubmit}
                    className={`w-full mt-3 px-5 py-3 rounded-lg font-medium flex items-center justify-center transition-all ${
                      purchaseOrderFile 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={isProcessing || !purchaseOrderFile}
                  >
                    {isProcessing ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiFileText className="mr-2" /> Submit Purchase Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isProcessing}
              >
                <FiArrowLeft className="mr-1" /> Back to Hours Selection
              </button>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Payment Method</h3>
                <p className="text-sm text-gray-500">Select your preferred payment gateway</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setActiveGateway('paypal')}
                  disabled={isProcessing || loadingScript}
                  className="w-full bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-100 hover:border-blue-200 transition-all disabled:opacity-50"
                >
                  <FaPaypal className="mr-2 text-xl" /> Pay with PayPal
                </button>
              </div>

              {activeGateway === 'paypal' && (
                <div className="mt-4">
                  <div id="paypal-button-container" className="mt-4"></div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Hours:</span>
                  <span className="font-medium">{hours}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Rate:</span>
                  <span className="font-medium flex items-center">
                    <FiDollarSign className="mr-1" /> {ratePerHour}/hour
                  </span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold flex items-center">
                    <FiDollarSign className="mr-1" /> {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Rate for: {countryName}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-600 p-4 rounded-full inline-flex items-center justify-center">
                <FiCheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {purchaseOrderStatus === 'success' 
                  ? 'PO Submitted Successfully!' 
                  : 'Payment Successful!'}
              </h3>
              <p className="text-gray-600">
                {purchaseOrderStatus === 'success' 
                  ? 'Your purchase order has been submitted. Please wait for admin approval.'
                  : `You've successfully purchased ${hours} hours of credit.`}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-1">Transaction Details</div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{purchaseOrderStatus === 'success' ? 'PO Amount:' : 'Amount Paid:'}</span>
                  <span className="font-medium flex items-center">
                    <FiDollarSign className="mr-1" /> {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Country Rate:</span>
                  <span>{countryName}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  StepPaymentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPaymentSuccess: PropTypes.func.isRequired,
    onPOUploadSuccess: PropTypes.func.isRequired,
    requiredHours: PropTypes.number,
    quotationId: PropTypes.string.isRequired,
  };

  export default StepPaymentModal;