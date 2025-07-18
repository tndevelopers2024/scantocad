import React, { useEffect, useState, useContext } from "react";
import { getQuotationsByuser } from "../../api";
import { useNavigate } from "react-router-dom";
import Loader from '../../contexts/Loader';
import { useSocket } from "../../contexts/SocketProvider";
import Notification from "../../contexts/Notification"; // Import Notification for update alerts
import { motion, AnimatePresence } from "framer-motion"; // For notification animations

const statusColor = {
  ongoing: "bg-indigo-100 text-indigo-800",
  completed: "bg-purple-100 text-purple-800",
  reported: "bg-yellow-100 text-yellow-800", 
};

const statusIcon = {
  ongoing: "🔄",
  completed: "🏁",
  reported: "⚠️", 
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function UserCompletedQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [quotesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("newest");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info"
  });
  const navigate = useNavigate();
   const { socket } = useSocket();

  const showTempNotification = (message, type = "info") => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchQuotations = () => {
    setIsLoading(true);
    getQuotationsByuser()
      .then((res) => {
        setQuotes(res.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Socket event listeners for real-time updates
useEffect(() => {
  if (!socket) return;

  const events = [
    "quotation:completed",
    "quotation:ongoing",
    "quotation:reported", // Add this new event
    "quotation:hour-updated",
    "quotation:userUpdated"
  ];

  const handleUpdate = () => {
    fetchQuotations();
    showTempNotification("Quotations updated", "info");
  };

  events.forEach(event => {
    socket.on(event, handleUpdate);
  });

  return () => {
    events.forEach(event => {
      socket.off(event, handleUpdate);
    });
  };
}, [socket]);

  // Filter quotes based on status
const filteredQuotes = statusFilter === "all"
  ? quotes.filter((q) => ["ongoing", "completed", "reported"].includes(q.status?.toLowerCase()))
  : quotes.filter((q) => q.status?.toLowerCase() === statusFilter);
  // Sort quotes by date (newest or oldest first)
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = sortedQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(sortedQuotes.length / quotesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 min-h-screen">
      {/* Notification for updates */}
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Completed & Ongoing
            </h1>
            <p className="text-gray-500 mt-1">
              Track completed and in-progress quotations
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
            <div className="mr-4">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            {["all", "ongoing", "completed", "reported"].map((status) => (
  <button
    key={status}
    onClick={() => {
      setStatusFilter(status);
      setCurrentPage(1);
    }}
    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
      statusFilter === status
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
  >
    {capitalize(status)}
  </button>
))}
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <Loader />
          ) : filteredQuotes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentQuotes.map((q) => (
                      <tr
                        key={q._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                              {q.projectName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {q.projectName}
                              </div>
                              <div className="text-sm text-gray-500">
                                #CSC{q._id.slice(-6).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(q.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(q.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusColor[q.status?.toLowerCase()] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusIcon[q.status?.toLowerCase()]}{" "}
                            {capitalize(q.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/app/quotes/${q._id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstQuote + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastQuote, sortedQuotes.length)}
                    </span>{" "}
                    of <span className="font-medium">{sortedQuotes.length}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md border ${
                          currentPage === number
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No quotations found
              </h3>
              <p className="mt-1 text-gray-500">
                No {capitalize(statusFilter)} quotations available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}