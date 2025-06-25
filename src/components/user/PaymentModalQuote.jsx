import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FiX, FiPlus, FiMinus, FiCheck, FiDollarSign,
  FiLoader, FiArrowRight, FiCheckCircle, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';
import { FaPaypal, FaRupeeSign } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';
import { getAllRates, getMe } from '../../api';

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
  const [currency, setCurrency] = useState('USD');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [availableRates, setAvailableRates] = useState([]);

  const totalPrice = hours * ratePerHour;
  const backendBaseUrl = 'https://ardpgimerchd.org/api/v1/payments';
  const token = localStorage.getItem('token');

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

// In your useEffect for fetching data
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingRate(true);
      setRateError(null);
      
      // Fetch rates first
      const ratesResponse = await getAllRates();
      if (!ratesResponse?.success || !ratesResponse?.data?.length) {
        throw new Error(ratesResponse?.message || 'No rates available');
      }
      
      setAvailableRates(ratesResponse.data);
      
      // Set initial rate (use first rate as fallback)
      const initialRate = ratesResponse.data[0]?.ratePerHour || 0;
      setRatePerHour(initialRate);
      
      // Then fetch user data to get preferred currency
      if (token) {
        const userResponse = await getMe();
        if (userResponse?.success && userResponse.data?.currency) {
          const userCurrency = userResponse.data.currency;
          setUserCurrency(userCurrency);
          
          // Find matching rate for user's currency
          const matchedRate = ratesResponse.data.find(
            rate => rate.currency === userCurrency
          );
          
          if (matchedRate) {
            setRatePerHour(matchedRate.ratePerHour);
            setCurrency(matchedRate.currency);
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRateError(error.message || 'Failed to load payment information');
      // Set default values if error occurs
      setRatePerHour(0);
      setCurrency('USD');
    } finally {
      setLoadingRate(false);
    }
  };

  if (isOpen) {
    fetchData();
  }
}, [isOpen, token]);

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
      setIsProcessing(true);
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
          currency,
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

  const startRazorpayPayment = async () => {
    if (!token) {
      alert('Please login to make a payment');
      return;
    }
  
    setIsProcessing(true);
    try {
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  
      // Convert to smallest currency unit (paise for INR, cents for others)
      const amountInSubunits = Math.round(totalPrice * (currency === 'INR' ? 100 : 100));
  
      const orderRes = await fetch(`${backendBaseUrl}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: amountInSubunits,
          hours, 
          gateway: 'razorpay',
          currency
        })
      });
  
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Failed to create order");
  
      const options = {
        key: 'rzp_test_9prjSZS0QLvGyK', // Replace with your actual key
        amount: orderData.order.amount,
        currency,
        name: "Your Company Name",
        description: `Purchase of ${hours} hours`,
        order_id: orderData.order.id,
        handler: (response) => {
          verifyPayment('razorpay', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        theme: {
          color: "#3399cc"
        },
        notes: {
          hours: hours.toString(),
          price: totalPrice.toString(),
          currency
        }
      };
  
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response) => {
        handlePaymentError(new Error(
          response.error.description || 
          `Payment failed: ${response.error.code}`
        ));
      });
      
      rzp.open();
    } catch (err) {
      handlePaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePaypal = async () => {
    if (!window.paypal) return;

    try {
      document.getElementById('paypal-button-container').innerHTML = '';
      
      // PayPal supports limited currencies, fallback to USD if needed
      const paypalSupportedCurrencies = ['USD', 'EUR', 'AUD', 'CAD', 'GBP'];
      const paypalCurrency = paypalSupportedCurrencies.includes(currency) ? currency : 'USD';
      
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'paypal'
        },
        createOrder: async function() {
          const orderRes = await fetch(`${backendBaseUrl}/order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              amount: totalPrice, 
              hours, 
              gateway: 'paypal',
              currency: paypalCurrency
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
      const paypalSupportedCurrencies = ['USD', 'EUR', 'AUD', 'CAD', 'GBP'];
      const paypalCurrency = paypalSupportedCurrencies.includes(currency) ? currency : 'USD';
      loadScript(`https://www.paypal.com/sdk/js?client-id=ASJQyCyGK6uKYaMMyOXb1wXXW1Q4OEcSJfxV_xYzXlccJZ-efkhFTtgim2mECDU4qZRtajbrkJBtqifY&currency=${paypalCurrency}`)
        .then(() => initializePaypal())
        .catch(err => handlePaymentError(err));
    }
  }, [activeGateway, step, currency]);

  const renderCurrencyIcon = () => {
    switch (currency) {
      case 'INR':
        return <FaRupeeSign className="mr-1" />;
      case 'USD':
      case 'AUD':
      case 'CAD':
      case 'SGD':
      case 'HKD':
        return <FiDollarSign className="mr-1" />;
      case 'EUR':
        return <span className="mr-1">€</span>;
      case 'GBP':
        return <span className="mr-1">£</span>;
      case 'JPY':
        return <span className="mr-1">¥</span>;
      default:
        return <span className="mr-1">{currency}</span>;
    }
  };

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
              {availableRates.length > 1 && (
                <div className="text-sm text-gray-500">
                  Available in: {availableRates.map(rate => rate.currency).join(', ')}
                </div>
              )}
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
                  {renderCurrencyIcon()} {totalPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">({currency})</div>
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
                onClick={() => {
                  setActiveGateway('razorpay');
                  startRazorpayPayment();
                }}
                disabled={isProcessing || loadingScript}
                className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-indigo-100 hover:border-indigo-200 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <SiRazorpay className="mr-2 text-xl" /> Pay with Razorpay
                  </>
                )}
              </button>
              
              <button
                onClick={() => setActiveGateway('paypal')}
                disabled={isProcessing || loadingScript || !['USD', 'EUR', 'AUD', 'CAD', 'GBP'].includes(currency)}
                className="w-full bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-100 hover:border-blue-200 transition-all disabled:opacity-50"
              >
                <FaPaypal className="mr-2 text-xl" /> Pay with PayPal
                {!['USD', 'EUR', 'AUD', 'CAD', 'GBP'].includes(currency) && (
                  <span className="text-xs ml-2">(USD only)</span>
                )}
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
                  {renderCurrencyIcon()} {ratePerHour}/hour
                </span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold flex items-center">
                  {renderCurrencyIcon()} {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Currency: {currency}
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
                  {renderCurrencyIcon()} {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Currency:</span>
                <span className="font-medium">{currency}</span>
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
  requiredHours: PropTypes.number,
};

export default StepPaymentModal;