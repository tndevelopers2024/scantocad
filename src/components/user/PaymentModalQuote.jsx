import React, { useState, useEffect,useRef } from 'react';
import PropTypes from 'prop-types';
import { countries } from 'country-data';
import { 
  FiX, FiPlus, FiMinus, FiCheck, FiDollarSign,
  FiLoader, FiArrowRight, FiCheckCircle, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';
import { FaPaypal } from 'react-icons/fa';
import { getCurrentRateByCountry, getMe } from '../../api';

const StepPaymentModal = ({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  requiredHours = 1,
}) => {
  const [step, setStep] = useState(1);
  const [hours, setHours] = useState(requiredHours);
  const [activeGateway, setActiveGateway] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [ratePerHour, setRatePerHour] = useState(0);
  const [loadingRate, setLoadingRate] = useState(true);
  const [rateError, setRateError] = useState(null);
  const [userCountry, setUserCountry] = useState('US');
  const [countryName, setCountryName] = useState('United States');
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
const paypalButtonContainerRef = useRef(null);

  // Strict 2-decimal-place calculation
    const calculateTotalPrice = () => {
    const rawPrice = hours * ratePerHour;
    // Round to exactly 2 decimal places
    const rounded = Math.round((rawPrice + Number.EPSILON) * 100) / 100;
    return rounded;
  };

  // Get the numeric total price
  const totalPrice = calculateTotalPrice();
  // Format for display (string with 2 decimals)
  const displayPrice = totalPrice.toFixed(2);
  const backendBaseUrl = 'http://31.97.202.82/api/v1/payments';
  const token = localStorage.getItem('token');

  // Get country name from country code
  const getCountryName = (code) => {
    const country = countries[code?.toUpperCase()];
    return country ? country.name : code || 'United States';
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setHours(requiredHours);
      setActiveGateway(null);
      setIsProcessing(false);
      setLoadingScript(false);
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
          const userResponse = await getMe();
          let detectedCountry = 'US';
          
          if (userResponse?.success && userResponse.data?.country) {
            detectedCountry = userResponse.data.country.toUpperCase();
          }
          
          setUserCountry(detectedCountry);
          setCountryName(getCountryName(detectedCountry));
          
          // Try to fetch rate for user's country
          try {
            const response = await getCurrentRateByCountry(detectedCountry);
            if (response.success && response.data) {
              // Ensure rate has exactly 2 decimal places
              const rate = parseFloat(response.data.ratePerHour).toFixed(2);
              setRatePerHour(parseFloat(rate));
              setLoadingRate(false);
              return;
            }
          } catch (error) {
            console.log(`No rate found for ${detectedCountry}, falling back to US`);
          }
          
          // Fall back to US rate
          const usResponse = await getCurrentRateByCountry('US');
          if (usResponse.success && usResponse.data) {
            const rate = parseFloat(usResponse.data.ratePerHour).toFixed(2);
            setRatePerHour(parseFloat(rate));
          } else {
            throw new Error('Failed to load default US rate');
          }
          
          setLoadingRate(false);
        } catch (error) {
          console.error('Failed to fetch rate:', error);
          setRateError(error.message || 'Failed to load payment information');
          setRatePerHour(0);
          setLoadingRate(false);
        }
      }
    };

    fetchUserCountryAndRate();
  }, [isOpen, token]);

  const handleIncrement = () => setHours(prev => prev + 1);
  const handleDecrement = () => setHours(prev => (prev > 1 ? prev - 1 : 1));

  
  const loadPaypalSdk = () => {
    setLoadingScript(true);
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        setPaypalSdkLoaded(true);
        setLoadingScript(false);
        return resolve();
      }

      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=AQs8LZvxayZ4NHhsoy2H2JVupJlFrpq9awpj0Wikn7YZLMy_411wOLA2rtsAWmQuWhsEdPf8zqIYleBp&currency=USD";
      script.onload = () => {
        setLoadingScript(false);
        setPaypalSdkLoaded(true);
        resolve();
      };
      script.onerror = () => {
        setLoadingScript(false);
        reject(new Error("Failed to load PayPal SDK"));
      };
      document.body.appendChild(script);
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    let errorMessage = 'Payment processing failed. Please try again.';
    
    if (typeof error === 'string' || 
        error.message?.includes('DECIMAL_PRECISION') || 
        error.message?.includes('UNPROCESSABLE_ENTITY')) {
      errorMessage = 'Invalid amount format. Amount must have exactly 2 decimal places (e.g., 10.00)';
    }
    
    alert(errorMessage);
    setIsProcessing(false);
  };

  const validateAmount = (amount) => {
    // Convert to string if it's a number
    const amountStr = typeof amount === 'number' ? amount.toFixed(2) : amount.toString();
    
    // Verify the amount has exactly 2 decimal places
    const decimalParts = amountStr.split('.');
    return decimalParts.length === 2 && decimalParts[1].length === 2;
  };

  const verifyPayment = async (gateway, verificationData) => {
    try {
      setIsProcessing(true);
      
      // Strict amount validation
      if (!validateAmount(totalPrice)) {
        throw new Error('Invalid amount format');
      }

      const paymentAmount = parseFloat(totalPrice);
      if (isNaN(paymentAmount)) {
        throw new Error('Invalid amount value');
      }

      const verifyRes = await fetch(`${backendBaseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gateway,
          amount: paymentAmount,
          hours,
          country: userCountry,
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
    } finally {
      setIsProcessing(false);
    }
  };

    const initializePaypal = async () => {
    try {
      const container = document.getElementById('paypal-button-container');
      if (!container) return;
      
      container.innerHTML = '';
      
      // Strict amount validation before PayPal initialization
      if (totalPrice < 0.5) {
        throw new Error('Minimum payment amount is $0.50');
      }

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'paypal'
        },
        createOrder: async (data, actions) => {
          try {
            // Log the amount being sent for debugging
            const amountInCents = Math.round(totalPrice * 100);
            console.log('Creating PayPal order for amount:', totalPrice);
            
            const orderRes = await fetch(`${backendBaseUrl}/order`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                amount: amountInCents, // Send the full amount in cents
                hours, 
                gateway: 'paypal',
                country: userCountry
              })
            });
            
            const orderData = await orderRes.json();
            if (!orderData.success) {
              throw new Error(orderData.message || "Failed to create order");
            }
            return orderData.order.id;
          } catch (error) {
            handlePaymentError(error);
            throw error;
          }
        },
        onApprove: async (data, actions) => {
          try {
            await verifyPayment('paypal', {
              paypal_order_id: data.orderID,
              amount: totalPrice // Verify with the correct amount
            });
          } catch (error) {
            handlePaymentError(error);
          }
        },
        onError: (err) => {
          handlePaymentError(err);
        }
      }).render('#paypal-button-container');
    } catch (err) {
      handlePaymentError(err);
    }
  };


  useEffect(() => {
    if (activeGateway === 'paypal' && step === 2) {
      if (paypalSdkLoaded) {
        initializePaypal();
      } else {
        loadPaypalSdk()
          .then(() => initializePaypal())
          .catch(err => handlePaymentError(err));
      }
    }
  }, [activeGateway, step, paypalSdkLoaded, totalPrice]);

  if (!isOpen) return null;

  if (loadingRate) {
    return (
      <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative text-center">
          <FiLoader className="animate-spin mx-auto text-2xl text-blue-600 mb-4" />
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (rateError) {
    return (
      <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative text-center">
          <FiAlertCircle className="mx-auto text-2xl text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{rateError}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 m-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
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
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Add credit hours</h3>
              <div className="text-sm text-gray-500">
                Rate for: {countryName} ({userCountry})
              </div>
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

            <div className="flex justify-center items-center gap-4">
              <div className="p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Total price</div>
                <div className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                  <FiDollarSign className="mr-1" /> {totalPrice}
                </div>
                <div className="text-xs text-gray-500 mt-1">(USD)</div>
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
                className={`w-full bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-100 hover:border-blue-200 transition-all ${
                  activeGateway === 'paypal' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <FaPaypal className="mr-2 text-xl" /> Pay with PayPal
                {loadingScript && <FiLoader className="animate-spin ml-2" />}
              </button>
            </div>

            {activeGateway === 'paypal' && (
              <div className="mt-4">
                <div id="paypal-button-container" ref={paypalButtonContainerRef} />
                {loadingScript && (
                  <div className="text-center py-4">
                    <FiLoader className="animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-500 mt-2">Loading PayPal...</p>
                  </div>
                )}
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
                  <FiDollarSign className="mr-1" /> {ratePerHour.toFixed(2)}/hour
                </span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold flex items-center">
                  <FiDollarSign className="mr-1" /> {totalPrice}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Rate for: {countryName} ({userCountry})
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-600 p-4 rounded-full inline-flex items-center justify-center">
              <FiCheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
            <p className="text-gray-600">
              You've successfully purchased <span className="font-semibold">{hours} hours</span> of credit.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium mb-1">Transaction Details</div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Amount Paid:</span>
                <span className="font-medium flex items-center">
                  <FiDollarSign className="mr-1" /> {totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Country Rate:</span>
                <span className="font-medium">{countryName} ({userCountry})</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Total Available Hours:</span>
                <span className="font-medium">
                  {hours} hours
                </span>
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