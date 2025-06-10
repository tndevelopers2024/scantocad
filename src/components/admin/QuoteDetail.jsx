import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getQuotationById,
  raiseQuote,
  completeQuotation,
  updateOngoing,
  updatePoStatus,
  updateEstimatedHours
} from "../../api";
import Notification from "../../contexts/Notification";
import STLViewer from "../../contexts/STLViewer";
import { motion } from "framer-motion";
import { useSocket } from "../../contexts/SocketProvider"; 
import {
  FiDownload,
  FiX,
  FiClock,
  FiCheckCircle,
  FiFile,
  FiUser,
  FiMail,
  FiInfo,
  FiThumbsUp,
  FiThumbsDown,
   FiEdit, 
} from "react-icons/fi";

const statusConfig = {
  requested: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <FiClock className="mr-1" />,
  },
  quoted: {
    color: "bg-blue-100 text-blue-800",
    icon: <FiFile className="mr-1" />,
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: <FiCheckCircle className="mr-1" />,
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: <FiX className="mr-1" />,
  },
   ongoing: {
    color: "bg-indigo-100 text-indigo-800",
    icon: <FiUser className="mr-1" />,
  },
  completed: {
    color: "bg-purple-100 text-purple-800",
    icon: <FiCheckCircle className="mr-1" />,
  },
};

const poStatusConfig = {
  requested: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <FiClock className="mr-1" />,
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: <FiThumbsUp className="mr-1" />,
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: <FiThumbsDown className="mr-1" />,
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function QuoteDetail() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiredHour, setRequiredHour] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showSTLViewer, setShowSTLViewer] = useState(false);
  const [completedFile, setCompletedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [updatingPoStatus, setUpdatingPoStatus] = useState(false);
 const [isEditingHours, setIsEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState("");
  const { socket } = useSocket(); 
 const [notification, setNotification] = useState({ show: false, message: "", type: "" });

const fetchQuote = async () => {
  try {
    const res = await getQuotationById(id);
    setQuote(res.data);
    
    // Store user details in session storage
    if (res.data?.user) {
      sessionStorage.setItem('userDetails', JSON.stringify(res.data.user));
    }
    
    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};

  useEffect(() => {
    fetchQuote();
  }, [id]);

  // ✅ Socket Logic
  useEffect(() => {
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

    console.log("Socket connected:", socket.connected);

    const events = [
      "quotation:requested",
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
    };

    events.forEach((event) => {
      socket.on(event, handleUpdate);
    });

    return () => {
      events.forEach((event) => {
        socket.off(event, handleUpdate);
      });
    };
  }, [socket, id]);

  // Helper function to show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Modify all your functions to use showNotification instead of setMessage
  const handleRaiseQuote = async () => {
    if (!requiredHour) {
      return showNotification("Required hour is mandatory", "error");
    }
    setSubmitting(true);
    try {
      const res = await raiseQuote(id, requiredHour);
      setQuote(res.data);
      showNotification("Quote raised successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to raise quote", "error");
    } finally {
      setSubmitting(false);
    }
  };


 const handleUpdateHours = async () => {
    if (!tempHours) {
      return showNotification("Required hour cannot be empty", "error");
    }
    setSubmitting(true);
    try {
      const res = await updateEstimatedHours(id, tempHours);
      setQuote(res.data);
      setRequiredHour(tempHours);
      setIsEditingHours(false);
      showNotification("Estimated hours updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update hours", "error");
    } finally {
      setSubmitting(false);
    }
  };


  const handleOngoing = async () => {
    setSubmitting(true);
    try {
      const res = await updateOngoing(id);
      setQuote(res.data);
      showNotification("Notification sent to customer that work has been started!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to Ongoing quote", "error");
    } finally {
      setSubmitting(false);
    }
  };


const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size (1GB limit)
  if (file.size > 1024 * 1024 * 1024) {
    setFileError("File exceeds 1GB limit");
    return;
  }

  setFileError("");
  setCompletedFile(file);
};

  const handleCompleteQuotation = async () => {
    if (!completedFile) {
      return showNotification("Please upload the completed file", "error");
    }
    setCompleting(true);
    try {
      const formData = new FormData();
      formData.append("completedFile", completedFile);
      const res = await completeQuotation(id, formData);
      setQuote(res.data);
      showNotification("Quotation as completed successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to complete quotation", "error");
    } finally {
      setCompleting(false);
    }
  };

  const handleUpdatePoStatus = async (status) => {
    setUpdatingPoStatus(true);
    try {
      const res = await updatePoStatus(id, status);
      setQuote(res.data);
      showNotification(`PO ${status} successfully!`, "success");
    } catch (err) {
      console.error(err);
      showNotification(`Failed to ${status} PO`, "error");
    } finally {
      setUpdatingPoStatus(false);
    }
  };

  const getUserDetailsFromStorage = () => {
    const storedUser = sessionStorage.getItem('userDetails');
    return storedUser ? JSON.parse(storedUser) : null;
  };
  const userDetails = getUserDetailsFromStorage();
  const isSTLFile = quote?.file?.toLowerCase().endsWith(".stl");

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (!quote)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-md">
          <FiX className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Quote not found
          </h3>
          <p className="mt-1 text-gray-500">
            The requested quotation could not be loaded.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">

       {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}


      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className=" mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {quote.projectName}
              </h1>
              <div className="flex items-center mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                    statusConfig[quote.status?.toLowerCase()]?.color ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusConfig[quote.status?.toLowerCase()]?.icon}
                  {capitalize(quote.status)}
                </span>
                <span className="ml-3 text-indigo-100">
                  Created: {new Date(quote.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
     <DetailCard
  icon={<FiInfo className="text-indigo-500" />}
  title="Project Details"
  items={[
    {
      label: "Description",
      value: quote.description || "Not provided",
    },
    {
      label: "Technical Details",
      value: quote.technicalInfo || "Not specified",
    },
    {
      label: "Live Transfer Format",
      value: quote.deliverables ? (
        <ul>
          {quote.deliverables.split(',').map((item, index) => (
            <li key={index}>{item.trim()}</li>
          ))}
        </ul>
      ) : (
        "Not specified"
      ),
    },
    quote.requiredHour
      ? {
          label: "Required Hours",
          value:
            isEditingHours && quote.status === "quoted" ? (
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={tempHours}
                  onChange={(e) => setTempHours(e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded mr-2"
                />
                <button
                  onClick={handleUpdateHours}
                  disabled={submitting}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditingHours(false)}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                {quote.requiredHour || "Not estimated yet"}
                {quote.status !== "completed" && (
                  <button
                    onClick={() => {
                      setTempHours(quote.requiredHour || "");
                      setIsEditingHours(true);
                    }}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                    title="Edit hours"
                  >
                    <FiEdit size={14} />
                  </button>
                )}
              </div>
            ),
        }
      : {
          label: "Required Hours",
          value: "Not estimated yet",
        },
  ].filter(Boolean)} // Filter out any null/false entries
/>


            <DetailCard
              icon={<FiUser className="text-indigo-500" />}
              title="Customer Information"
              items={[
                { label: "Name", value: userDetails.name || "N/A" },
                { label: "Email", value: userDetails.email || "N/A" },
                {
                  label: "Contact",
                  value: userDetails.phone || "Not provided",
                },
              ]}
            />
          </div>

          {/* Files Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiFile className="mr-2 text-indigo-500" />
              Files
            </h3>

            <div className="space-y-4">
              <FileCard
                title="Original File"
                filename={quote.file?.split("/").pop()}
                url={getAbsoluteUrl(quote.file)}
                onPreview={() => isSTLFile && setShowSTLViewer(true)}
                canPreview={isSTLFile}
              />

              {quote.completedFile && (
                <FileCard
                  title="Completed File"
                  filename={quote.completedFile?.split("/").pop()}
                  url={getAbsoluteUrl(quote.completedFile)}
                />
              )}
            </div>
          </div>

          {/* Action Sections */}
          {quote.status === "requested" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-100"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Raise Quote
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter hours"
                    value={requiredHour}
                    onChange={(e) => setRequiredHour(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleRaiseQuote}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Submit Quote"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        {quote.poStatus && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className={`rounded-lg p-6 mb-6 border ${
      quote.poStatus === "requested"
        ? "bg-yellow-50 border-yellow-100"
        : quote.poStatus === "approved"
        ? "bg-green-50 border-green-100"
        : "bg-red-50 border-red-100"
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {quote.poStatus === "requested"
            ? "Purchase Order Approval"
            : quote.poStatus === "approved"
            ? "Purchase Order"
            : "Purchase Order Rejected"}
        </h3>
        <div className="flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
              poStatusConfig[quote.poStatus?.toLowerCase()]?.color ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {poStatusConfig[quote.poStatus?.toLowerCase()]?.icon}
            {capitalize(quote.poStatus)}
          </span>
          {quote.poStatus === "rejected" && (
            <p className="ml-3 text-sm text-red-600">
              This purchase order has been rejected
            </p>
          )}
        </div>
      </div>

      {quote.poStatus === "requested" && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdatePoStatus("approved")}
            disabled={updatingPoStatus}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center"
          >
            {updatingPoStatus ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FiThumbsUp className="mr-1" />
                Approve PO
              </>
            )}
          </button>
          <button
            onClick={() => handleUpdatePoStatus("rejected")}
            disabled={updatingPoStatus}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center"
          >
            {updatingPoStatus ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FiThumbsDown className="mr-1" />
                Reject PO
              </>
            )}
          </button>
        </div>
      )}
    </div>

    {quote.payment?.purchaseOrderFile && (
      <div className="mt-4">
        {quote.poStatus === "approved" ? (
          <FileCard
            title="Purchase Order File"
            filename={quote.payment?.purchaseOrderFile?.split("/").pop()}
            url={getAbsoluteUrl(quote.payment?.purchaseOrderFile)}
          />
        ) : quote.poStatus === "requested" ? (
          <FileCard
            title="Purchase Order File (Pending Approval)"
            filename={quote.payment?.purchaseOrderFile?.split("/").pop()}
            url={getAbsoluteUrl(quote.payment?.purchaseOrderFile)}
          />
        ) : (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700">
              <span className="font-medium">Original PO File:</span>{" "}
              {quote.payment?.purchaseOrderFile?.split("/").pop()}
            </p>
            <p className="text-sm text-red-500 mt-1">
              This file is no longer available for download as the PO was
              rejected.
            </p>
          </div>
        )}
      </div>
    )}
  </motion.div>
)}

    {quote.status === "approved" && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-purple-50 flex justify-between items-center rounded-lg p-6 mb-6 border border-purple-100"
  >
    <h3 className="text-lg font-semibold text-purple-800 mb-4">
      Make Quotation to Ongoing
    </h3>
    <div className="flex items-center">
      <button
        onClick={handleOngoing}
        disabled={submitting}
        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-70 flex items-center"
      >
        {submitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          "Make it Ongoing"   
        )}
      </button>
    </div>
  </motion.div>
)}


  {quote.status === "ongoing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 rounded-lg p-6 mb-6 border border-green-100"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">
            Upload CAD file
              </h3>
            <div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Upload Completed Files
    </label>
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
      <div className="space-y-1 text-center">
        <div className="flex text-sm text-gray-600">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
            <span>Upload a file</span>
            <input
              type="file"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          Any file type accepted (up to 1GB)
        </p>
      </div>
    </div>
    {fileError && (
      <p className="mt-1 text-sm text-red-600">{fileError}</p>
    )}
    {completedFile && (
      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {completedFile.name}
          </p>
          <p className="text-xs text-gray-500">
            {(completedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={() => setCompletedFile(null)}
          className="text-red-500 hover:text-red-700"
        >
          <FiX />
        </button>
      </div>
    )}
  </div>
  <button
    onClick={handleCompleteQuotation}
    disabled={completing || !completedFile}
    className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center ${
      completing
        ? "bg-green-400"
        : !completedFile
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {completing ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Processing...
      </>
    ) : (
      "Mark as Completed"
    )}
  </button>
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

        
        </div>
      </motion.div>

      {/* STL Viewer Modal */}
      {showSTLViewer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white h-full rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">3D Model Viewer</h3>
              <button
                onClick={() => setShowSTLViewer(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <STLViewer file={getAbsoluteUrl(quote.file)} />
            </div>
            <div className="p-4 border-t flex justify-end">
              <a
                href={getAbsoluteUrl(quote.file)}
                download
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <FiDownload className="mr-2" />
                Download File
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

const DetailCard = ({ icon, title, items }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="ml-2 font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index}>
          <p className="text-md text-black">{item.label} :</p>
          <p className="text-gray-500">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

const FileCard = ({ title, filename, url, onPreview, canPreview = false }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-gray-900 font-medium">{filename}</p>
    </div>
    <div className="flex space-x-2">
      {canPreview && (
        <button
          onClick={onPreview}
          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-sm hover:bg-indigo-100 transition-colors"
        >
          Preview
        </button>
      )}
      <a
        href={url}
        download
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center"
      >
        <FiDownload className="mr-1" />
        Download
      </a>
    </div>
  </div>
);

const getAbsoluteUrl = (path) => {
  if (!path) return "#";
  if (path.startsWith("http")) return path;
  return `https://ardpgimerchd.org${path}`;
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
