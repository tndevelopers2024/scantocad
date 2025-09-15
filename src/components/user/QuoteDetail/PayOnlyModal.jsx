// src/components/QuoteDetail/PayOnlyModal.jsx
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { countries } from "country-data";
import { FiX, FiLoader, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import { getCurrentRateByCountry, getMe } from "../../../api";

const BACKEND_BASE = "https://convertscantocad.in/api/v1/payments"; // keep for order creation
const PAYONLY_ENDPOINT = "/api/payment/pay-only"; // your payOnly endpoint (relative)
const PAYPAL_CLIENT_ID = "AQs8LZvxayZ4NHhsoy2H2JVupJlFrpq9awpj0Wikn7YZLMy_411wOLA2rtsAWmQuWhsEdPf8zqIYleBp"; // replace if needed

const getCountryName = (code) => {
  const c = countries[code?.toUpperCase()];
  return c ? c.name : code;
};

export default function PayOnlyModal({
  isOpen,
  onClose,
  quotationId,
  requiredHours = 1,
  onSuccess = () => {},
  showNotification = (msg, type) => {},
}) {
  const [loadingRate, setLoadingRate] = useState(true);
  const [ratePerHour, setRatePerHour] = useState(0);
  const [rateError, setRateError] = useState(null);
  const [userCountry, setUserCountry] = useState("US");
  const [countryName, setCountryName] = useState("United States");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const paypalRef = useRef(null);

  const token = localStorage.getItem("token");

  const totalPrice = Number(((requiredHours || 1) * (ratePerHour || 0)).toFixed(2)); // USD

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const fetchRate = async () => {
      try {
        setLoadingRate(true);
        setRateError(null);

        const userData = await getMe();
        const detectedCountry = userData?.data?.country?.toUpperCase() || "US";
        const countryDisplayName = getCountryName(detectedCountry);

        if (!mounted) return;
        setUserCountry(detectedCountry);
        setCountryName(countryDisplayName);

        // try country rate
        try {
          const resp = await getCurrentRateByCountry(detectedCountry);
          if (resp?.success && resp?.data) {
            setRatePerHour(Number(resp.data.ratePerHour));
            setLoadingRate(false);
            return;
          }
        } catch (err) {
          // ignore and fallback
        }

        // fallback to US
        const usResp = await getCurrentRateByCountry("US");
        if (usResp?.success && usResp?.data) {
          setRatePerHour(Number(usResp.data.ratePerHour));
        } else {
          throw new Error("Failed to fetch default rate");
        }
        setLoadingRate(false);
      } catch (err) {
        console.error("Failed to fetch rate:", err);
        setRateError(err.message || "Failed to load pricing");
        setRatePerHour(0);
        setLoadingRate(false);
      }
    };

    fetchRate();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // load PayPal SDK and render Buttons; use backend order creation then call pay-only on approve
  useEffect(() => {
    if (!isOpen || loadingRate || rateError || totalPrice <= 0) return;

    let mounted = true;
    const loadSdk = async () => {
      try {
        if (!window.paypal) {
          const script = document.createElement("script");
          script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
          script.async = true;
          document.body.appendChild(script);
          await new Promise((res, rej) => {
            script.onload = res;
            script.onerror = () => rej(new Error("PayPal SDK failed to load"));
          });
        }

        if (!mounted || !paypalRef.current) return;
        paypalRef.current.innerHTML = ""; // clear old

        window.paypal.Buttons({
          style: { shape: "rect", color: "blue", layout: "vertical", label: "paypal" },
          createOrder: async () => {
            // Create order on your backend (consistent with StepPaymentModal)
            // Backend expects amount in cents for order creation
            const cents = Math.round(totalPrice * 100);
            const resp = await fetch(`${BACKEND_BASE}/order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                amount: cents,
                hours: requiredHours,
                quotationId,
                country: userCountry,
                gateway: "paypal",
              }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
              throw new Error(data.message || "Failed to create PayPal order");
            }
            // Return order id
            return data.order?.id || data.orderID || data.order?.result?.id;
          },
          onApprove: async (data) => {
            // On client approve — call your /api/payment/pay-only to capture and record payment
            setIsProcessing(true);
            try {
              const payload = {
                gateway: "paypal",
                paypal_order_id: data.orderID,
                amount: totalPrice,
                currency: "USD",
                quotationId,
              };
              const verifyRes = await fetch(PAYONLY_ENDPOINT, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.message || "Payment verification failed");
              }

              setCompleted(true);
              showNotification("Payment recorded", "success");
              onSuccess(verifyData.payment || verifyData);
            } catch (err) {
              console.error("pay-only error:", err);
              showNotification(err.message || "Payment failed", "error");
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (err) => {
            console.error("PayPal onError:", err);
            showNotification(err.message || "PayPal error", "error");
          },
        }).render(paypalRef.current);
      } catch (err) {
        console.error("Failed to init PayPal:", err);
        showNotification(err.message || "Failed to initialize PayPal", "error");
      }
    };

    loadSdk();

    return () => {
      mounted = false;
      if (paypalRef.current) paypalRef.current.innerHTML = "";
    };
  }, [isOpen, loadingRate, rateError, totalPrice, requiredHours, userCountry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
        <button
          onClick={() => { onClose(); setCompleted(false); }}
          disabled={isProcessing}
          className="absolute right-3 top-3 p-1 text-gray-600 hover:text-gray-900"
        >
          <FiX size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-2">Pay Invoice (PayPal)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Quotation: <span className="font-medium">#{quotationId?.slice?.(-8)?.toUpperCase()}</span>
        </p>

        {loadingRate ? (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-t-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <div>Loading pricing...</div>
          </div>
        ) : rateError ? (
          <div className="bg-red-50 p-4 rounded text-red-700">{rateError}</div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Hours required</div>
                <div className="font-medium">{requiredHours}</div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Rate ({countryName})</div>
                <div className="font-medium"><FiDollarSign className="inline mr-1" />{ratePerHour}</div>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                <div className="font-medium">Total</div>
                <div className="text-lg font-bold flex items-center">
                  <FiDollarSign className="inline mr-1" />{totalPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {!completed ? (
              <div>
                <div ref={paypalRef} id="paypal-button-container" />
                {isProcessing && (
                  <div className="mt-3 text-sm text-gray-600 flex items-center"><FiLoader className="animate-spin mr-2" /> Processing...</div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center bg-green-50 rounded-full p-3">
                  <FiCheckCircle className="text-green-600" size={28} />
                </div>
                <div className="text-lg font-semibold">Payment completed</div>
                <div className="text-sm text-gray-600">Thank you — your payment has been recorded.</div>
                <button
                  onClick={() => { onClose(); setCompleted(false); }}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

PayOnlyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  quotationId: PropTypes.string.isRequired,
  requiredHours: PropTypes.number,
  onSuccess: PropTypes.func,
  showNotification: PropTypes.func,
};
