import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getQuotationById,
  raiseQuote,
  completeQuotation,
  updateOngoing,
  updatePoStatus,
  updateEstimatedHours,
  uploadIssuedFiles,
} from "../../api";
import Notification from "../../contexts/Notification";
import STLViewer from "../../contexts/STLViewer";
import { motion, AnimatePresence } from "framer-motion";
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
  FiMinimize,
  FiMaximize,
  FiSave,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import FileCompletionSection from "./QuoteDetails/FileCompletionSection";

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
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [showSTLViewerFullscreen, setShowSTLViewerFullscreen] = useState(false);
  const [completedFile, setCompletedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [updatingPoStatus, setUpdatingPoStatus] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState("");
  const { socket } = useSocket();
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileHours, setFileHours] = useState({});
  const [editingFileId, setEditingFileId] = useState(null);
  const [tempFileHour, setTempFileHour] = useState("");
  const [activeTab, setActiveTab] = useState("original");
  const [previewingFileIndex, setPreviewingFileIndex] = useState(null);

  const fetchQuote = async () => {
    try {
      const res = await getQuotationById(id);
      setQuote(res.data);

      if (res.data?.user) {
        sessionStorage.setItem("userDetails", JSON.stringify(res.data.user));
      }

      // Initialize file hours
      if (res.data?.files) {
        const initialFileHours = {};
        res.data.files.forEach((file) => {
          initialFileHours[file._id] = file.requiredHour || "";
        });
        setFileHours(initialFileHours);
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

  useEffect(() => {
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

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

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleRaiseQuote = async () => {
    // Calculate total from individual file hours
    const totalHours = quote.files.reduce(
      (sum, file) => sum + (fileHours[file._id] || 0),
      0
    );

    if (totalHours <= 0) {
      return showNotification(
        "Please set hours for at least one file",
        "error"
      );
    }

    // Prepare files with individual required hours
    const filesWithHours = quote.files.map((file) => ({
      fileId: file._id,
      requiredHour: fileHours[file._id] || 0,
    }));

    // Validate each required hour
    const invalidFiles = filesWithHours.filter(
      (file) => isNaN(file.requiredHour) || file.requiredHour < 0
    );
    if (invalidFiles.length > 0) {
      return showNotification(
        "Please enter valid hours for all files",
        "error"
      );
    }

    setSubmitting(true);
    try {
      const res = await raiseQuote(id, totalHours, filesWithHours);
      setQuote(res.data);
      showNotification("Quote raised successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to raise quote", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingFileHour = (fileId, currentHour) => {
    setEditingFileId(fileId);
    setTempFileHour(currentHour);
  };

  const saveFileHour = (fileId) => {
    if (isNaN(tempFileHour)) {
      showNotification("Please enter a valid number for hours", "error");
      return;
    }

    setFileHours((prev) => ({
      ...prev,
      [fileId]: Number(tempFileHour),
    }));

    setEditingFileId(null);
    setTempFileHour("");
  };

  const adjustHours = (fileId, delta) => {
    setFileHours((prev) => ({
      ...prev,
      [fileId]: Math.max(0, parseFloat(prev[fileId] || 0) + delta),
    }));
  };

  const updateHours = (fileId, value) => {
    setFileHours((prev) => ({
      ...prev,
      [fileId]: parseFloat(value) || 0,
    }));
  };

  const handleUpdateHours = async () => {
    setSubmitting(true);
    try {
      // Prepare files with their updated hours
      const filesWithHours = quote.files.map((file) => ({
        _id: file._id,
        requiredHour: fileHours[file._id] || 0,
      }));

      // Calculate total hours from individual file hours
      const totalHours = filesWithHours.reduce(
        (sum, file) => sum + (file.requiredHour || 0),
        0
      );

      // Call the API with both individual file hours and total hours
      const res = await updateEstimatedHours(id, filesWithHours, totalHours);

      setQuote(res.data);
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
      showNotification(
        "Notification sent to customer that work has been started!",
        "success"
      );
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
    const storedUser = sessionStorage.getItem("userDetails");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const userDetails = getUserDetailsFromStorage();
  const isSTLFile = (filename) => {
    if (!filename) return false;
    const lower = filename.toLowerCase();
    return (
      lower.endsWith(".stl") || lower.endsWith(".ply") || lower.endsWith(".obj")
    );
  };

  const navigateFile = (direction) => {
    if (direction === "prev") {
      setCurrentFileIndex((prev) =>
        prev > 0 ? prev - 1 : quote.files.length - 1
      );
    } else {
      setCurrentFileIndex((prev) =>
        prev < quote.files.length - 1 ? prev + 1 : 0
      );
    }
  };

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
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="mx-auto bg-white rounded-xl shadow-md overflow-hidden"
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
                      {quote.deliverables.split(",").map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    "Not specified"
                  ),
                },
                {
                  label: "Required Hours",
                  value: quote.requiredHour || "Not estimated yet",
                },
              ]}
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

          <div className="space-y-6 mb-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("original")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "original"
                      ? "border-[#155DFC] text-[#155DFC]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Original Files ({quote.files?.length || 0})
                </button>
               {(quote.status === "completed" || quote.status === "reported") && (
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "completed"
                        ? "border-[#155DFC] text-[#155DFC]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Completed Files ({quote.files?.filter((file) => file.status === "completed").length || 0})
                  </button>
                )}
                {quote.infoFiles?.length > 0 && (
                  <button
                    onClick={() => setActiveTab("supporting")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "supporting"
                        ? "border-[#155DFC] text-[#155DFC]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Supporting Documents ({quote.infoFiles.length})
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {/* Original Files Content */}
              {activeTab === "original" && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Original Files Section */}
                  <div className="mb-6">
                    <div className="space-y-2">
                      {/* Header Row */}
                      <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-gray-600 px-3">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">File Name</div>
                        <div className="col-span-4">Estimated Hours</div>
                        <div className="col-span-2">Actions</div>
                      </div>

                      {/* File Rows - Replaced with the new hour editing component */}
                      <div className="space-y-2">
                        {quote.files?.map((file, index) => (
                          <div
                            key={file._id}
                            className="grid grid-cols-12 gap-4 items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm"
                          >
                            {/* Index */}
                            <div className="col-span-1 rounded-md text-center font-medium text-sm text-[#5D36F7] bg-[#E0E7FF] w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </div>

                            {/* File Name */}
                            <div className="col-span-5 text-sm text-gray-800 truncate">
                              {file.originalFile?.split("/").pop()}
                            </div>

                            {/* Estimated Hours Counter */}
                            <div className="col-span-3 flex items-center justify-center space-x-2">
                              {quote.status === "quoted" ||
                              quote.status === "requested" ? (
                                <>
                                  <button
                                    className="px-2 py-1 text-orange-500 border border-orange-200 rounded hover:bg-orange-50"
                                    onClick={() => adjustHours(file._id, -1)}
                                  >
                                    –
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="w-12 p-1.5 text-center border border-gray-300 rounded text-sm"
                                    value={fileHours[file._id] || 0}
                                    onChange={(e) =>
                                      updateHours(file._id, e.target.value)
                                    }
                                  />
                                  <button
                                    className="px-2 py-1 text-orange-500 border border-orange-200 rounded hover:bg-orange-50"
                                    onClick={() => adjustHours(file._id, 1)}
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <span className="text-sm text-gray-600 text-center">
                                  {fileHours[file._id] || 0}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex items-center justify-end space-x-3">
                              {isSTLFile(file.originalFile) && (
                                <button
                                  onClick={() => {
                                    setCurrentFileIndex(index);
                                    setPreviewingFileIndex(index);
                                  }}
                                  className="text-blue-600 text-sm hover:underline"
                                >
                                  Preview
                                </button>
                              )}
                              <a
                                href={getAbsoluteUrl(file.originalFile)}
                                download
                                className="text-gray-700 hover:text-gray-900"
                                title="Download"
                              >
                                <FiDownload size={16} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        {quote.status === "quoted" && (
                          <div className="text-md font-medium text-gray-700">
                            Total Hours:{" "}
                            <span className="font-bold text-blue-600">
                              {quote.files?.reduce(
                                (sum, file) => sum + (fileHours[file._id] || 0),
                                0
                              )}
                            </span>
                          </div>
                        )}

                        {quote.status === "quoted" && (
                          <button
                            onClick={handleRaiseQuote}
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                          >
                            {submitting ? "updating..." : "Update Quote"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STL Preview Section */}
                  {previewingFileIndex !== null &&
                    quote.files?.some((f) => isSTLFile(f.originalFile)) && (
                      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            3D Model Preview
                          </h3>
                          <div className="flex space-x-2">
                            {quote.files.length > 1 && (
                              <>
                                <button
                                  onClick={() => navigateFile("prev")}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title="Previous file"
                                >
                                  <FiArrowLeft />
                                </button>
                                <button
                                  onClick={() => navigateFile("next")}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title="Next file"
                                >
                                  <FiArrowRight />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setShowSTLViewerFullscreen(true)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Fullscreen"
                            >
                              <FiMaximize />
                            </button>
                            <button
                              onClick={() => setPreviewingFileIndex(null)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Close preview"
                            >
                              <FiX />
                            </button>
                          </div>
                        </div>
                        <div className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
                          <STLViewer
                            file={getAbsoluteUrl(
                              quote.files[currentFileIndex]?.originalFile
                            )}
                            style={{ height: "100%", width: "100%" }}
                          />
                        </div>
                        <div className="mt-2 text-sm text-gray-500 text-center">
                          File {currentFileIndex + 1} of {quote.files.length}
                        </div>
                      </div>
                    )}

                  {/* Show placeholder when no file is being previewed */}
                  {previewingFileIndex === null && (
                    <div
                      className="bg-white rounded-xl shadow-sm p-6 mt-6 flex flex-col items-center justify-center"
                      style={{ minHeight: "300px" }}
                    >
                      <FiFile className="text-gray-400 text-4xl mb-4" />
                      <p className="text-gray-500 text-center">
                        Select a file to preview 3D model
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Files Content */}
              {activeTab === "completed" && (
                <div className="space-y-3">
                  {quote.files?.map((file, index) => (
                    <FileCard
                      key={`completed-${index}`}
                      title={`Completed File ${index + 1}`}
                      filename={file?.name || file?.url?.split("/").pop()}
                      url={getAbsoluteUrl(file?.completedFile)}
                    />
                  ))}
                </div>
              )}


              {/* Supporting Documents Content */}
              {activeTab === "supporting" && (
                <div className="space-y-3">
                  {quote.infoFiles?.map((file, index) => (
                    <FileCard
                      key={`info-${index}`}
                      title={`Document ${index + 1}`}
                      filename={file.split("/").pop()}
                      url={getAbsoluteUrl(file)}
                    />
                  ))}
                </div>
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
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Raise Quote
              </h3>
              <div className="space-y-4">
                {/* Show calculated total hours */}
                <div className=" p-3 pl-0 rounded-lg ">
                  <p className="text-lg font-medium text-gray-700">
                    Total Estimated Hours:{" "}
                    <span className="font-bold text-blue-800">
                      {quote.files?.reduce(
                        (sum, file) => sum + (fileHours[file._id] || 0),
                        0
                      )}
                    </span>
                  </p>
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
                      filename={quote.payment?.purchaseOrderFile
                        ?.split("/")
                        .pop()}
                      url={getAbsoluteUrl(quote.payment?.purchaseOrderFile)}
                    />
                  ) : quote.poStatus === "requested" ? (
                    <FileCard
                      title="Purchase Order File (Pending Approval)"
                      filename={quote.payment?.purchaseOrderFile
                        ?.split("/")
                        .pop()}
                      url={getAbsoluteUrl(quote.payment?.purchaseOrderFile)}
                    />
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700">
                        <span className="font-medium">Original PO File:</span>{" "}
                        {quote.payment?.purchaseOrderFile?.split("/").pop()}
                      </p>
                      <p className="text-sm text-red-500 mt-1">
                        This file is no longer available for download as the PO
                        was rejected.
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
            <FileCompletionSection
              files={quote.files}
              quotationId={quote._id}
              onUploadSuccess={() => {
                fetchQuote();
              }}
            />
          )}

          {/* Rejection Message Display */}
          {quote.status === "rejected" && quote.rejectionReason && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow"
            >
              <h4 className="font-medium text-red-800">
                Rejection Reason:{" "}
                <span className="text-red-700 mt-1">
                  {quote.rejectionReason}
                </span>
              </h4>
              <p className="text-red-700 mt-1">{quote.rejectionDetails}</p>
            </motion.div>
          )}

          {quote.status === "reported" && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h4 className="font-medium text-gray-800">Notes:</h4>
                <p className="text-gray-600">{quote.notes}</p>
              </div>
              <AdminIssuedFilesSection
                files={quote.files}
                quotationId={quote._id}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Fullscreen STL Viewer Modal */}
      <AnimatePresence>
        {showSTLViewerFullscreen && quote.files?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white h-full w-full max-w-6xl rounded-lg p-4 relative flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">3D Model Preview</h3>
                <div className="flex space-x-4">
                  {quote.files.length > 1 && (
                    <>
                      <button
                        onClick={() => navigateFile("prev")}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Previous file"
                      >
                        &larr;
                      </button>
                      <button
                        onClick={() => navigateFile("next")}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Next file"
                      >
                        &rarr;
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowSTLViewerFullscreen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Exit fullscreen"
                  >
                    <FiMinimize />
                  </button>
                  <button
                    onClick={() => {
                      setShowSTLViewerFullscreen(false);
                      setPreviewingFileIndex(null);
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="flex-grow relative">
                <STLViewer
                  file={getAbsoluteUrl(
                    quote.files[currentFileIndex]?.originalFile
                  )}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>

              <div className="mt-2 text-sm text-gray-500 text-center">
                File {currentFileIndex + 1} of {quote.files.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

const forceDownload = async (url, filename = "file") => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed", err);
    alert("Failed to download the file.");
  }
};

const FileCard = ({
  title,
  filename,
  url,
  onPreview,
  canPreview = false,
  status,
  uploadedAt,
  reported,
  notes,
  isCompleted = false,
  originalFileUrl,
}) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-gray-900 font-medium">{filename}</p>
        {status && (
          <span
            className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
              status === "completed"
                ? "bg-green-100 text-green-800"
                : status === "reported"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {status === "completed"
              ? "Completed"
              : status === "reported"
              ? "Issues Reported"
              : status}
          </span>
        )}
        {uploadedAt && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(uploadedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        {isCompleted && originalFileUrl && (
          <button
            onClick={() => forceDownload(originalFileUrl, filename)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Download Original"
          >
            <FiFile size={16} /> Download
          </button>
        )}
        {canPreview && (
          <button
            onClick={onPreview}
            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-sm hover:bg-indigo-100 transition-colors"
          >
            Preview
          </button>
        )}
        <button
          onClick={() => forceDownload(url, filename)}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center"
        >
          <FiDownload className="mr-1" />
          Download
        </button>
      </div>
    </div>

    {notes && (
      <div className="mt-3 bg-blue-50 p-3 rounded">
        <h5 className="text-sm font-medium text-blue-800">Notes:</h5>
        <p className="text-sm text-blue-700 mt-1">{notes}</p>
      </div>
    )}

    {reported && (
      <div className="mt-3 bg-red-50 p-3 rounded">
        <h5 className="text-sm font-medium text-red-800">Issues:</h5>
        <p className="text-sm text-red-700 mt-1">{reported}</p>
      </div>
    )}
  </div>
);

const AdminIssuedFilesSection = ({ files, quotationId }) => {
  const [filesToReupload, setFilesToReupload] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Get all files that need reuploading (reported issues)
  const reportedFiles = files.filter(file => file.userReportedStatus !== "ok");

  // Check if all reported files have a selected file for reupload
  const allReportedFilesSelected = reportedFiles.length > 0 && 
    reportedFiles.every(file => filesToReupload[file._id]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const handleFileChange = (fileId, file) => {
    setFilesToReupload(prev => ({
      ...prev,
      [fileId]: file,
    }));
  };

 const handleReupload = async () => {
  if (!allReportedFilesSelected) {
    showNotification("Please select replacement files for all reported issues", "error");
    return;
  }

  setUploading(true);
  setProgress(0);
  
  try {
    // Get array of file IDs in order
    const fileIds = reportedFiles.map(file => file._id);

    await uploadIssuedFiles(
      quotationId, 
      filesToReupload, 
      fileIds,
      {
        onUploadProgress: (progress) => {
          setProgress(progress);
          setNotification({
            show: true,
            message: progress < 100 
              ? `Uploading... ${progress}%`
              : "Finalizing upload...",
            type: "info"
          });
        },
      }
    );

    showNotification("Files reuploaded successfully!", "success");
    setFilesToReupload({});

    window.location.reload();
  } catch (error) {
    console.error("Reupload failed:", error);
    
    let errorMessage = error.userMessage || "Failed to reupload files";
    if (error.response?.status === 400) {
      errorMessage += ": " + (error.details || "Invalid file format or selection");
    }
    
    showNotification(errorMessage, "error");
  } finally {
    setUploading(false);
  }
};

  const downloadFile = (fileUrl, fileName) => {
    if (!fileUrl) return;

    const link = document.createElement("a");
    link.href = getAbsoluteUrl(fileUrl);
    link.download = fileName || fileUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Issued Files Management</h3>

      {notification.show && (
        <div
          className={`mb-4 p-3 rounded ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : notification.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="space-y-4">
        {files.map((file) => (
          <div key={file._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">
                  {file.originalFile?.split("/").pop()}
                </h4>
                <div className="mt-1 flex items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      file.userReportedStatus === "ok"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {file.userReportedStatus === "ok"
                      ? "No Issues"
                      : "Issues Reported"}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Estimated Hours: {file.requiredHour || 0}
                  </span>
                </div>
                {file.userNotes && (
                  <p className="ml-2 mt-2 block text-sm text-gray-500">
                    Notes: {file.userNotes || "No notes available"}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Download buttons */}
                {file.originalFile && (
                  <button
                    onClick={() =>
                      downloadFile(
                        file.originalFile,
                        `original_${file.originalFile.split("/").pop()}`
                      )
                    }
                    className="p-2 flex items-center gap-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    title="Download Original File"
                  >
                    <FiDownload className="h-4 w-4" /> Original
                  </button>
                )}

                {file.completedFile && (
                  <button
                    onClick={() =>
                      downloadFile(
                        file.completedFile,
                        `completed_${file.completedFile.split("/").pop()}`
                      )
                    }
                    className="p-2 flex items-center gap-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    title="Download Completed File"
                  >
                    <FiFile className="h-4 w-4" /> Completed
                  </button>
                )}

                {/* File reupload section */}
                {file.userReportedStatus !== "ok" && (
                  <div className="flex flex-col items-end">
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(file._id, e.target.files[0])
                        }
                        disabled={uploading}
                      />
                      {filesToReupload[file._id] ? "Change File" : "Select File"}
                    </label>
                    {filesToReupload[file._id] && (
                      <span className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {filesToReupload[file._id].name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {file.reported && (
              <div className="mt-3 bg-red-50 p-3 rounded">
                <h5 className="text-sm font-medium text-red-800">
                  Reported Issues:
                </h5>
                <p className="text-sm text-red-700 mt-1">{file.reported}</p>
              </div>
            )}

            {file.notes && (
              <div className="mt-3 bg-blue-50 p-3 rounded">
                <h5 className="text-sm font-medium text-blue-800">Admin Notes:</h5>
                <p className="text-sm text-blue-700 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {reportedFiles.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleReupload}
            disabled={uploading || !allReportedFilesSelected}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center w-full md:w-auto ${
              uploading
                ? "bg-blue-400 cursor-wait"
                : !allReportedFilesSelected
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {uploading ? (
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
                Uploading {progress}%
              </>
            ) : allReportedFilesSelected ? (
              `Reupload ${reportedFiles.length} File${reportedFiles.length > 1 ? "s" : ""}`
            ) : (
              `Select ${reportedFiles.length - Object.keys(filesToReupload).length} More File${reportedFiles.length - Object.keys(filesToReupload).length !== 1 ? "s" : ""}`
            )}
          </button>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getAbsoluteUrl = (path) => {
  if (!path) return "#";
  if (path.startsWith("http")) return path;
  return `https://ardpgimerchd.org${path}`;
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
