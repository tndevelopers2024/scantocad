import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuotationById, getUserHours, updateUserDecision } from "../../api";
import STLViewer from "../../contexts/STLViewer";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiX,
  FiCheck,
  FiXCircle,
  FiClock,
  FiUser,
  FiMail,
  FiFile,
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

export default function QuoteDetail() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionMessage, setDecisionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availableHours, setAvailableHours] = useState(null);
  const [showSTLViewer, setShowSTLViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  useEffect(() => {
    getQuotationById(id)
      .then((res) => {
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
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleDecision = async (status) => {
    if (!["approved", "rejected"].includes(status)) return;

    setSubmitting(true);
    setDecisionMessage("");

    try {
      const res = await updateUserDecision(id, status);
      setQuote(res.data);
      setDecisionMessage(`Quote successfully ${status}`);
    } catch (error) {
      console.error("Decision failed:", error);
      setDecisionMessage("Failed to submit decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSTLFile = quote?.file?.toLowerCase().endsWith(".stl");

  if (loading) return <LoadingSpinner />;
  if (!quote) return <NotFoundMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quote.projectName}
            </h1>
            <div className="flex items-center mt-2 space-x-4">
              <StatusBadge status={quote.status} />
              <span className="text-gray-500 text-sm">
                Created: {new Date(quote.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowSTLViewer(true)}
              disabled={!isSTLFile}
              className={`flex items-center px-4 py-2 rounded-lg shadow-sm ${isSTLFile
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <FiFile className="mr-2" />
              {isSTLFile ? "View 3D Model" : "View File"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 font-medium text-sm ${activeTab === "details"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Project Details
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-4 py-3 font-medium text-sm ${activeTab === "files"
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

                      <DetailCard
                        title="Technical Details"
                        icon={<FiFile className="text-blue-500" />}
                        className="mt-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Required Hours
                            </h4>
                            <p className="text-lg font-semibold">
                              {quote.requiredHour || "N/A"}
                            </p>
                          </div>
                          {availableHours !== null && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Your Available Hours
                              </h4>
                              <p
                                className={`text-lg font-semibold ${availableHours >= quote.requiredHour
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
                        <FileCard
                          title="Completed File"
                          fileUrl={quote.completedFile}
                          className="mt-4"
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Decision Panel */}
            {quote.status === "quoted" && availableHours !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden p-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Submit Your Decision
                </h3>

                {availableHours >= quote.requiredHour ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You have enough hours to approve this quote.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ActionButton
                        onClick={() => handleDecision("approved")}
                        disabled={submitting}
                        variant="success"
                        icon={<FiCheck />}
                      >
                        {submitting ? "Processing..." : "Approve Quote"}
                      </ActionButton>

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
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex justify-between">
                      <div className="flex-shrink-0">
                        <FiXCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          You don't have enough available hours to approve this
                          quote. You need {quote.requiredHour - availableHours}{" "}
                          more hours.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-50 flex items-center justify-center px-5  py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Purchase Hours
                      </button>
                    </div>
                  </div>
                )}

                {decisionMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 p-3 rounded-md ${decisionMessage.includes("successfully")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                      }`}
                  >
                    {decisionMessage}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>
              <div className="space-y-3">
                <SummaryItem
                  label="Project ID"
                  value={id.slice(-8).toUpperCase()}
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
                <SummaryItem
                  label="Required Hours"
                  value={quote.requiredHour || "N/A"}
                />
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
            </div>

            {quote.status === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2 text-green-800">
                  Project Completed
                </h3>
                <p className="text-green-700">
                  This project has been successfully completed.
                </p>
                {quote.completedFile && (
                  <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                    <FiDownload className="mr-2" />
                    Download Final Files
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {/* Activity History Section */}
      <div className="bg-white mt-5 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity History</h3>
          <Timeline status={quote.status} />
        </div>
      </div>
      {/* STL Viewer Modal */}

      <StepPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        hoursNeeded={quote.requiredHour - availableHours}
      // pass any other props your modal needs
      />
      {showSTLViewer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl relative">
            <button
              onClick={() => setShowSTLViewer(false)}
              className="absolute top-2 right-2 text-black text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-2">3D File Preview</h3>
            <STLViewer file={getAbsoluteUrl(quote.file)} />
          </div>
        </div>
      )}
    </div>
  );
}

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://5000-firebase-scantocadbackendgit-1747203690155.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev${path}`;
};
