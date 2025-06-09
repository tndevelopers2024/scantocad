import React, { useEffect, useState } from "react";
import { getQuotationById, getUserHours, updateUserDecision, rejectWithMessage, updateUserDecisionPO } from "../../api";
import STLViewer from "../../contexts/STLViewer";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketProvider";

import {
  FiDownload,
  FiX,
  FiCheck,
  FiXCircle,
  FiClock,
  FiUser,
  FiMail,
  FiFile,
  FiArrowLeft,
} from "react-icons/fi";
import StatusBadge from "./QuoteDetail/StatusBadge";
import DetailCard from "./QuoteDetail/DetailCard";
import FileCard from "./QuoteDetail/FileCard";
import ActionButton from "./QuoteDetail/ActionButton";
import SummaryItem from "./QuoteDetail/SummaryItem";
import Timeline from "./QuoteDetail/Timeline";
import LoadingSpinner from "./QuoteDetail/LoadingSpinner";
import NotFoundMessage from "./QuoteDetail/NotFoundMessage";
import StepPaymentModal from "./PaymentModal";
import Notification from "../../contexts/Notification";

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionMessage, setDecisionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availableHours, setAvailableHours] = useState(null);
  const [showSTLViewer, setShowSTLViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionReasonInput, setShowRejectionReasonInput] = useState(false);
  const { socket } = useSocket();
  const [rejectionDetails, setRejectionDetails] = useState("");


  const fetchQuote = async () => {
    try {
      const res = await getQuotationById(id);
      setQuote(res.data);
      setLoading(false);

      if (res?.data?.status === "quoted") {
        getUserHours()
          .then((data) => {
            if (data?.data?.hours) {
              setAvailableHours(data.data.hours);
            }
          })
          .catch(console.error);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [id]);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

    console.log("Socket connected:", socket.connected);

    const events = [
      "quotation:raised",
      "quotation:updated",
      "quotation:decision",
      "quotation:completed",
      "quotation:ongoing",
      "quotation:hour-updated",
      "quotation:userUpdated",
    ];

    const handleUpdate = () => {
      console.log("Socket event received");
      fetchQuote();
      showTempNotification("Quote updated", "info");
    };

    events.forEach(event => {
      socket.on(event, handleUpdate);
    });

    return () => {
      events.forEach(event => {
        socket.off(event, handleUpdate);
      });
    };
  }, [socket, id]);

  const showTempNotification = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleDecision = async (status) => {
    if (!["approved", "rejected"].includes(status)) return;

    setSubmitting(true);
    setDecisionMessage("");

    try {
      if (status === "rejected") {
        // If rejecting, show the rejection message input
        setShowRejectionReasonInput(true);
        setSubmitting(false);
        return;
      }

      // For approval, proceed as before
      await updateUserDecision(id, status);
      const res = await getQuotationById(id);
      setQuote(res.data);
      showTempNotification(`Quote successfully ${status}`, "success");
    } catch (error) {
      console.error("Decision failed:", error);
      showTempNotification("Failed to submit decision.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAfterRejection = async () => {
  setSubmitting(true);
  try {
    await updateUserDecision(id, "approved");
    const res = await getQuotationById(id);
    setQuote(res.data);
    showTempNotification("Quote successfully approved", "success");
  } catch (error) {
    console.error("Approval failed:", error);
    showTempNotification("Failed to approve quote.", "error");
  } finally {
    setSubmitting(false);
  }
};

const handleRejectionWithMessage = async () => {
  // Validate inputs
  if (!rejectionReason) {
    showTempNotification("Please select a rejection reason", "error");
    return;
  }
  if (!rejectionDetails.trim()) {
    showTempNotification("Please provide rejection details", "error");
    return;
  }

  setSubmitting(true);
  try {
    const response = await rejectWithMessage(id, {
      rejectionReason,
      rejectionMessage: rejectionDetails.trim(),
    });

    if (response.success) {
      const res = await getQuotationById(id);
      setQuote(res.data);
      setShowRejectionReasonInput(false);
      setRejectionReason("");
      setRejectionDetails("");
      showTempNotification("Quote rejected successfully", "success");
    } else {
      showTempNotification(response.error || "Failed to submit rejection.", "error");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Failed to submit rejection.";
    showTempNotification(errorMessage, "error");
  } finally {
    setSubmitting(false);
  }
};

  const handleDecisionPO = async (status) => {
    if (!["approved", "rejected"].includes(status)) return;

    setSubmitting(true);
    setDecisionMessage("");

    try {
      // First, submit the decision
      await updateUserDecisionPO(id, status);

      // Then, fetch the latest quote data
      const res = await getQuotationById(id);
      setQuote(res.data);

      showTempNotification(`Quote successfully ${status}`, "success");
    } catch (error) {
      console.error("Decision failed:", error);
      showTempNotification("Failed to submit decision.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isSTLFile = quote?.file?.toLowerCase().endsWith(".stl");

  if (loading) return <LoadingSpinner />;
  if (!quote) return <NotFoundMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <Notification
            message={notificationMessage}
            type={notificationType}
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-start space-x-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => navigate(-1)}
                className="flex mb-2 bg-[#2990f1] px-[10px] py-[8px] rounded-full items-center text-white hover:text-white hover:bg-blue-700 mt-1"
              >
                <FiArrowLeft className="" />
                
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {quote.projectName}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge status={quote.status} />
                <span className="text-gray-500 text-sm">
                  Created: {new Date(quote.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 md:mt-0"
          >
            <button
              onClick={() => setShowSTLViewer(true)}
              disabled={!isSTLFile}
              className={`flex items-center px-4 py-2 rounded-lg shadow-sm ${
                isSTLFile
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FiFile className="mr-2" />
              {isSTLFile ? "View 3D Model" : "View File"}
            </button>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === "details"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Project Details
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === "files"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Files & Attachments
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DetailCard
                        title="Description"
                        icon={<FiClock className="text-blue-500" />}
                      >
                        <p className="text-gray-700">
                          {quote.description || "No description provided"}
                        </p>
                      </DetailCard>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <DetailCard
                          title="Customer Information"
                          icon={<FiUser className="text-blue-500" />}
                          className="mt-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <FiUser className="text-gray-400 mr-2" />
                              <span>{quote.user?.name || "N/A"}</span>
                            </div>
                            <div className="flex items-center">
                              <FiMail className="text-gray-400 mr-2" />
                              <span>{quote.user?.email || "N/A"}</span>
                            </div>
                          </div>
                        </DetailCard>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <DetailCard
                          title="Technical Details"
                          icon={<FiFile className="text-blue-500" />}
                          className="mt-4"
                        >
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Technical Info</h4>
                              <p className="text-md">{quote.technicalInfo}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Live Transfer Format</h4>
                              <ul className="list-disc list-inside text-md space-y-1">
                                {quote.deliverables?.split(',').map((item, index) => (
                                  <li key={index}>{item.trim()}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {quote.requiredHour && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Required Hours</h4>
                                <p className="text-lg font-semibold">
                                  {quote.requiredHour}
                                </p>
                              </div>
                            )}
                            {availableHours !== null && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Your Available Hours</h4>
                                <p
                                  className={`text-lg font-semibold ${
                                    availableHours >= quote.requiredHour ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {availableHours}
                                </p>
                              </div>
                            )}
                          </div>
                        </DetailCard>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === "files" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FileCard
                        title="Original File"
                        fileUrl={quote.file}
                        onPreview={() => setShowSTLViewer(true)}
                        previewable={isSTLFile}
                      />

                      {quote.status === "completed" && quote.completedFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <FileCard
                            title="Completed File"
                            fileUrl={quote.completedFile}
                            className="mt-4"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* PO Status Message */}
            {quote.poStatus === "approved" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className=""
              >
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow">
                  <div className="flex justify-between items-center">
                    <p className="text-green-700">
                      Your Purchase Order is approved. Admin about to start the project and will notify here.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rejection Message Display */}
            {quote.status === "rejected" && quote.rejectionReason && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow"
              >
                <h4 className="font-medium text-red-800">Rejection Reason: <span className="text-red-700 mt-1">{quote.rejectionReason}</span></h4>
                
                <p className="text-red-700 mt-1">{quote.rejectionDetails}</p>
              </motion.div>
            )}

            {/* Decision Panel */}
            {quote.status === "quoted" && (
              <>
                {/* CASE: poStatus is null/empty or "approved" => show approve options */}
                {(!quote.poStatus || quote.poStatus === "approved") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Submit Your Decision</h3>

                    {(availableHours >= quote.requiredHour || quote.poStatus === "approved") ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          You have enough hours to approve this quote.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {(quote.poStatus === "approved") ? (
                            <ActionButton
                              onClick={() => handleDecisionPO("approved")}
                              disabled={submitting}
                              variant="success"
                              icon={<FiCheck />}
                            >
                              {submitting ? "Processing..." : "Approve Quote"}
                            </ActionButton>
                          ) : (
                            <ActionButton
                              onClick={() => handleDecision("approved")}
                              disabled={submitting}
                              variant="success"
                              icon={<FiCheck />}
                            >
                              {submitting ? "Processing..." : "Approve Quote"}
                            </ActionButton>
                          )}

                          <ActionButton
                            onClick={() => handleDecision("rejected")}
                            disabled={submitting}
                            variant="danger"
                            icon={<FiXCircle />}
                          >
                            {submitting ? "Processing..." : "Reject Quote"}
                          </ActionButton>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="bg-red-50 border-l-4 border-red-400 p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <FiXCircle className="h-5 w-5 text-red-400" />
                            <p className="text-sm text-red-700">
                              You don't have enough available hours to approve this quote.
                              You need {quote.requiredHour - availableHours} more hours.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="ml-4 px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Purchase Hours
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Rejection Message Input */}
             {showRejectionReasonInput && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mt-4"
  >
    <h3 className="text-lg font-semibold mb-4">Rejection Details</h3>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Rejection
        </label>
        <select
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a reason...</option>
          <option value="price">Too expensive</option>
          <option value="timeline">Not needed anymore</option>
          <option value="user_rejection">Found another provider</option>
          <option value="requirements">Requirements changed</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Details
        </label>
        <textarea
          value={rejectionDetails}
          onChange={(e) => setRejectionDetails(e.target.value)}
          placeholder="Please provide details about why you're rejecting this quote..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          required
        />
      </div>
    </div>

    <div className="flex justify-end space-x-3 mt-4">
      <button
        onClick={() => {
          setShowRejectionReasonInput(false);
          setRejectionReason("");
          setRejectionDetails("");
        }}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={handleRejectionWithMessage}
        disabled={submitting || !rejectionReason || !rejectionDetails.trim()}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
      >
        {submitting ? "Submitting..." : "Submit Rejection"}
      </button>
    </div>
  </motion.div>
)}
                {/* CASE: poStatus is "requested" => show some text */}
                {quote.poStatus === "requested" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow">
                    <p className="text-yellow-800 font-medium">
                      Your request has been submitted and is awaiting approval.
                    </p>
                  </div>
                )}

                {/* CASE: poStatus is "rejected" => show purchase button with message */}
                {quote.poStatus === "rejected" && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
                    <div className="flex justify-between items-center">
                      <p className="text-red-700">
                        Your purchase order was rejected. You can reupload your purchase order or purchase hours to try again.
                      </p>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="ml-4 px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Purchase Hours
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
           <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
  className="bg-white rounded-xl shadow-sm p-6"
>
  <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>
  <div className="space-y-3">
    <SummaryItem
      label="Project ID"
      value={`#CSC` + id.slice(-8).toUpperCase()}
    />
    <SummaryItem
      label="Status"
      value={<StatusBadge status={quote.status} />}
    />
    <SummaryItem
      label="Created"
      value={new Date(quote.createdAt).toLocaleDateString()}
    />
    <SummaryItem
      label="Last Updated"
      value={new Date(quote.updatedAt).toLocaleDateString()}
    />
    {quote.requiredHour && (
      <SummaryItem
        label="Required Hours"
        value={quote.requiredHour || "N/A"}
      />
    )}
    {availableHours !== null && (
      <SummaryItem
        label="Your Available Hours"
        value={
          <span
            className={
              availableHours >= quote.requiredHour
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {availableHours}
          </span>
        }
      />
    )}
  </div>
  
  {/* Add this section for approve option when rejected */}
  {quote.status === "rejected" && (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
       Have you changed your mind? Would you like to accept the quote now?

      </h4>
      <button
        onClick={handleApproveAfterRejection}
        disabled={submitting}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
      >
        {submitting ? "Processing..." : "Approve Quote"}
      </button>
    </div>
  )}
</motion.div>

            {quote.status === "completed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
                className="bg-green-50 border border-green-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-2 text-green-800">
                  Project Completed
                </h3>
                <p className="text-green-700">
                  Project {`#CSC` + id.slice(-8).toUpperCase()} has been successfully completed. Download CAD file.
                </p>
                {quote.completedFile && (
                  <a href={quote.completedFile} download className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                    <FiDownload className="mr-2" />
                    Download Final Files
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Activity History Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white mt-5 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity History</h3>
          <Timeline status={quote.status} />
        </div>
      </motion.div>

      {/* Payment Modal */}
      <StepPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        requiredHours={quote.requiredHour - availableHours}
        quotationId={id}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          showTempNotification("Payment successful! Your hours have been updated.", "success");
          // Refresh available hours
          getUserHours()
            .then((data) => {
              if (data?.data?.hours) {
                setAvailableHours(data.data.hours);
              }
            })
            .catch(console.error);
        }}
        onPOUploadSuccess={() => {
          setShowPaymentModal(false);
          showTempNotification("PO uploaded successfully! Please wait for Admin to respond to your PO.", "success");
          // You might want to refresh the quote data here
          getQuotationById(id)
            .then((res) => {
              setQuote(res.data);
            })
            .catch(console.error);
        }}
      />

      {/* STL Viewer Modal */}
      <AnimatePresence>
        {showSTLViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white h-full overflow-hidden rounded-lg p-4 w-full max-w-4xl relative"
            >
              <button
                onClick={() => setShowSTLViewer(false)}
                className="absolute top-2 right-2 text-black text-2xl font-bold"
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-2">3D File Preview</h3>
              <STLViewer file={getAbsoluteUrl(quote.file)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://ardpgimerchd.org${path}`;
};