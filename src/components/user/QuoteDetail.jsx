import React, { useEffect, useState } from "react";
import {
  getQuotationById,
  getUserHours,
  updateUserDecision,
  rejectWithMessage,
  updateUserDecisionPO,
  deleteFile,
  reportQuotationIssues,
} from "../../api";
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
  FiMaximize,
  FiMinimize,
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiAlertTriangle,
  FiEdit2,
  FiSend,
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
  const [showSTLViewerFullscreen, setShowSTLViewerFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionReasonInput, setShowRejectionReasonInput] =
    useState(false);
  const { socket } = useSocket();
  const [rejectionDetails, setRejectionDetails] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [issueNotes, setIssueNotes] = useState({});
  const [generalNote, setGeneralNote] = useState("");
  const [fileReports, setFileReports] = useState([]);
  const [mainNote, setMainNote] = useState("");
  const [showIssueReportModal, setShowIssueReportModal] = useState(false);
  const [previewingFileIndex, setPreviewingFileIndex] = useState(null);

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

    events.forEach((event) => {
      socket.on(event, handleUpdate);
    });

    return () => {
      events.forEach((event) => {
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

  const confirmDelete = (fileId) => {
    setFileToDelete(fileId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteFile(id, fileToDelete);
      showTempNotification("File deleted successfully", "success");
      fetchQuote();
    } catch (error) {
      console.error("Error deleting file:", error);
      showTempNotification("Failed to delete file", "error");
    } finally {
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const handleDecision = async (status) => {
    if (!["approved", "rejected"].includes(status)) return;

    setSubmitting(true);
    setDecisionMessage("");

    try {
      if (status === "rejected") {
        setShowRejectionReasonInput(true);
        setSubmitting(false);
        return;
      }

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
        showTempNotification(
          response.error || "Failed to submit rejection.",
          "error"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit rejection.";
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
      await updateUserDecisionPO(id, status);
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
    setPreviewingFileIndex(currentFileIndex);
  };

  const handleFileStatusChange = (index, status) => {
    setFileReports((prev) => {
      const newReports = [...prev];
      if (!newReports[index]) {
        newReports[index] = { index, status, note: "" };
      } else {
        newReports[index] = { ...newReports[index], status };
      }
      return newReports;
    });
  };

  const handleSubmitIssues = async () => {
    try {
      const fileReports = selectedFiles.map((index) => ({
        index,
        status: "reported",
        note: issueNotes[index] || "",
      }));

      await reportQuotationIssues(quote._id, {
        fileReports,
        mainNote: generalNote || "Note not provided",
      });

      showTempNotification("Issues reported successfully", "success");

      // Optionally clear state before reload
      setSelectedFiles([]);
      setIssueNotes({});
      setGeneralNote("");

      // Full page reload
      window.location.reload();
    } catch (error) {
      console.error("Failed to report issues:", error);
      showTempNotification(
        error.userMessage || "Failed to report issues",
        "error"
      );
    }
  };

  const handleSubmitIssueReport = async () => {
    try {
      const reportsToSubmit = fileReports.filter(
        (report) => report && (report.status === "reported" || report.note)
      );

      await reportQuotationIssues(quote._id, {
        fileReports: reportsToSubmit,
        mainNote,
      });

      showTempNotification("Issue report submitted successfully", "success");
      setShowIssueReportModal(false);
      fetchQuote();
    } catch (error) {
      console.error("Failed to submit issue report:", error);
      showTempNotification(
        error.userMessage || "Failed to submit report",
        "error"
      );
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!quote) return <NotFoundMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
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
        className=" mx-auto"
      >
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden "
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
                  onClick={() => setActiveTab("originalFiles")}
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === "originalFiles"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Original Files ({quote.files?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("supportingDocuments")}
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === "supportingDocuments"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Supporting Docs ({quote.infoFiles?.length || 0})
                </button>

                  

                {quote.status === "completed" && (
                  <button
                    onClick={() => setActiveTab("completedFiles")}
                    className={`px-4 py-3 font-medium text-sm ${
                      activeTab === "completedFiles"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Completed Files (
                    {quote.files?.filter((file) => file.status === "completed")
                      .length || 0}
                    )
                  </button>
                )}

                 {(quote.quotationFile?.length > 0 || quote.completedQuotationFile?.length > 0) && (
  <button
    onClick={() => setActiveTab("quotationFile")}
    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
      activeTab === "quotationFile"
        ? "border-[#155DFC] text-[#155DFC]"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    Quotation & invoice Docs (
    {(quote.quotationFile ? 1 : 0) + (quote.completedQuotationFile ? 1 : 0)}
    )
  </button>
)}

              </div>

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
                              <h4 className="text-sm font-medium text-gray-500">
                                Technical Info
                              </h4>
                              <p className="text-md">{quote.technicalInfo}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Live Transfer Format
                              </h4>
                              <ul className="list-disc list-inside text-md space-y-1">
                                {quote.deliverables
                                  ?.split(",")
                                  .map((item, index) => (
                                    <li key={index}>{item.trim()}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {quote.requiredHour && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Required Hours
                                </h4>
                                <p className="text-lg font-semibold">
                                  {quote.requiredHour}
                                </p>
                              </div>
                            )}
                            {availableHours !== null && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Your Available Hours
                                </h4>
                                <p
                                  className={`text-lg font-semibold ${
                                    availableHours >= quote.requiredHour
                                      ? "text-green-600"
                                      : "text-red-600"
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

                  {activeTab === "originalFiles" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Original Files
                        </h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 gap-3 bg-gray-100 px-2 py-2 text-sm font-semibold text-gray-700">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-4">File</div>
                            {quote.status !=="requested" &&
                            <div className="col-span-2 text-center">
                              Required Hours
                            </div>
                            }
                            <div className={`${quote.status !=="requested"? "col-span-5" : "col-span-7"} text-right`}>Actions</div>
                          </div>
                          {quote.files?.length > 0 ? (
  <>
    {quote.files.map((file, index) => (
      <FileCard
        key={file._id}
        index={index}
        title={
          file.fileSourceType === 'cloud_link'
            ? `Cloud File ${index + 1}`
            : `File ${index + 1}`
        }
        requiredHour={file.requiredHour}
        fileUrl={file.originalFile}
        fileSourceType={file.fileSourceType}
        onPreview={() => {
          setCurrentFileIndex(index);
          setPreviewingFileIndex(index);
        }}
        previewable={isSTLFile(file.originalFile)}
        status={file.status}
        uploadedAt={file.uploadedAt}
        onDelete={() => confirmDelete(file._id)}
        deletable={quote.status === "quoted"}
      />
    ))}
  </>
) : (
  <p className="text-gray-500 text-center py-4">
    No original files uploaded
  </p>
)}

                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "supportingDocuments" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {quote.infoFiles?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Supporting Documents
                          </h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-10 gap-3 bg-gray-100 px-2 py-2 text-sm font-semibold text-gray-700">
                              <div className="col-span-1 text-start">#</div>
                              <div className="col-span-4 text-start">File</div>
                              <div className="col-span-5 text-end">Actions</div>
                            </div>
                            {quote.infoFiles.map((file, index) => (
                              <FileCard
                                index={index}
                                key={`info-${index}`}
                                title={`Document ${index + 1}`}
                                fileUrl={file}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "completedFiles" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {quote.status === "completed" &&
                        quote.files?.some((f) => f.completedFile) && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">
                              Completed Files
                            </h3>
                            <div className="space-y-3">
                              <div className="grid grid-cols-12 gap-3 bg-gray-100 px-2 py-2 text-sm font-semibold text-gray-700">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-4">File</div>
                                <div className="col-span-5 text-right">
                                  Actions
                                </div>
                              </div>
                              {quote.files
                                .filter((f) => f.completedFile)
                                .map((file, index) => (
                                  <FileCard
                                    index={index}
                                    key={`completed-${file._id}`}
                                    title={`Completed File ${index + 1}`}
                                    fileUrl={file.completedFile}
                                    className="mt-4"
                                    quote={quote}
                                    onReportIssue={() => {
                                      if (!selectedFiles.includes(index)) {
                                        setSelectedFiles((prev) => [
                                          ...prev,
                                          index,
                                        ]);
                                      }
                                    }}
                                    isReported={selectedFiles.includes(index)}
                                  />
                                ))}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  )}

                   {activeTab === "quotationFile" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {quote.quotationFile?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Quotation & Invoice Documents
                          </h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-10 gap-3 bg-gray-100 px-2 py-2 text-sm font-semibold text-gray-700">
                              <div className="col-span-1 text-start">#</div>
                              <div className="col-span-4 text-start">File</div>
                              <div className="col-span-5 text-end">Actions</div>
                            </div>
                             {quote.quotationFile && (
                              <FileCard
                                index={'1'}
                             
                                title={`Document`}
                                fileUrl={quote.quotationFile}
                              />
                            )}
                             {quote.completedQuotationFile && (
                              <FileCard
                                index={'2'}
                                
                                title={`Document `}
                                fileUrl={quote.completedQuotationFile}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>

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

            {quote.status === "quoted" && (
              <>
                {(!quote.poStatus || quote.poStatus === "approved") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden  p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Submit Your Decision
                    </h3>

                    {availableHours >= quote.requiredHour ||
                    quote.poStatus === "approved" ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          You have enough hours to approve this quote.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {quote.poStatus === "approved" ? (
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
                              You don't have enough available hours to approve
                              this quote. You need{" "}
                              {quote.requiredHour - availableHours} more hours.
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

                {showRejectionReasonInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mt-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Rejection Details
                    </h3>

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
                          <option value="user_rejection">
                            Found another provider
                          </option>
                          <option value="requirements">
                            Requirements changed
                          </option>
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
                        disabled={
                          submitting ||
                          !rejectionReason ||
                          !rejectionDetails.trim()
                        }
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                      >
                        {submitting ? "Submitting..." : "Submit Rejection"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {quote.poStatus === "requested" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow">
                    <p className="text-yellow-800 font-medium">
                      Your request has been submitted and is awaiting approval.
                    </p>
                  </div>
                )}

                {quote.poStatus === "rejected" && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
                    <div className="flex justify-between items-center">
                      <p className="text-red-700">
                        Your purchase order was rejected. You can reupload your
                        purchase order or purchase hours to try again.
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

            {quote.status === "completed" && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FiAlertTriangle className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Report File Issues
                  </h3>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-medium mb-3 text-gray-700">
                      Files with Issues
                    </h4>
                    <div className="space-y-4">
                      {selectedFiles.map((fileIndex) => {
                        const file = quote?.files?.[fileIndex];
                        if (!file) return null;

                        return (
                          <div
                            key={file._id || fileIndex}
                            className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-2 rounded mr-3">
                                <FiFile className="text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  File {fileIndex + 1}
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {file.originalFile?.split("/").pop()}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1 max-w-md mx-4">
                              <div className="relative">
                                <textarea
                                  value={issueNotes[fileIndex] || ""}
                                  onChange={(e) =>
                                    setIssueNotes((prev) => ({
                                      ...prev,
                                      [fileIndex]: e.target.value,
                                    }))
                                  }
                                  placeholder="Describe the issue..."
                                  className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:border-transparent"
                                  rows={2}
                                />
                                <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                                  {issueNotes[fileIndex]?.length || 0}/500
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedFiles((prev) =>
                                  prev.filter((idx) => idx !== fileIndex)
                                );
                                setIssueNotes((prev) => {
                                  const updated = { ...prev };
                                  delete updated[fileIndex];
                                  return updated;
                                });
                              }}
                              className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Remove file"
                            >
                              <FiX className="text-lg" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center mb-2">
                    <FiEdit2 className="text-gray-500 mr-2" />
                    <h4 className="font-medium text-gray-700">
                      Additional Notes
                    </h4>
                  </div>
                  <div className="relative">
                    <textarea
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      placeholder="Any other concerns or questions? Let us know..."
                      className="w-full p-4 border border-gray-300 rounded-lg resize-none  focus:border-transparent"
                      rows={4}
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {generalNote.length}/1000
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitIssues}
                    disabled={selectedFiles.length === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedFiles.length > 0
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } flex items-center`}
                  >
                    <FiSend className="mr-2" />
                    Submit Issues
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {previewingFileIndex !== null &&
              quote.files?.length > 0 &&
              isSTLFile(quote.files[currentFileIndex]?.originalFile) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">3D Model Preview</h3>
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
                        onClick={() => {
                          setShowSTLViewerFullscreen(true);
                          setPreviewingFileIndex(currentFileIndex);
                        }}
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
                </motion.div>
              )}

            {previewingFileIndex === null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <FiFile className="text-gray-400 text-4xl mb-4" />
                <p className="text-gray-500 text-center">
                  Select a file to preview 3D model
                </p>
              </motion.div>
            )}

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

              {quote.status === "rejected" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Have you changed your mind? Would you like to accept the
                    quote now?
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
                  Project {`#CSC` + id.slice(-8).toUpperCase()} has been
                  successfully completed. Download CAD file.
                </p>
                {quote.files?.some((f) => f.completedFile) && (
                  <div className="flex flex-col space-y-3 mt-4">
                    <button
                      onClick={() => {
                        setActiveTab("completedFiles");
                        window.scrollTo({ top: 0, behavior: "smooth" }); // 👈 scrolls to top smoothly
                      }}
                      className={`px-4 py-3 font-medium text-sm ${
                        activeTab === "completedFiles"
                          ? "text-green-600 border-b-2 border-green-600"
                          : "w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-7000"
                      }`}
                    >
                      View Completed Files
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

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

      <StepPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        requiredHours={quote.requiredHour - availableHours}
        quotationId={id}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          showTempNotification(
            "Payment successful! Your hours have been updated.",
            "success"
          );
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
          showTempNotification(
            "PO uploaded successfully! Please wait for Admin to respond to your PO.",
            "success"
          );
          getQuotationById(id)
            .then((res) => {
              setQuote(res.data);
            })
            .catch(console.error);
        }}
      />

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
                    onClick={() => setShowSTLViewerFullscreen(false)}
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
      {showDeleteConfirm && (
        <AnimatePresence>
          <motion.div
            key="delete-confirm-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p className="mb-4">
                  Are you sure you want to delete this file? This action cannot
                  be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirmed}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://ardpgimerchd.org${path}`;
};
