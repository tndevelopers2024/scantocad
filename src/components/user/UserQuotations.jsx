import React, { useEffect, useState, useRef } from "react";
import { getQuotationsByuser, deleteQuote } from "../../api";
import { useNavigate } from "react-router-dom";
import Notification from "../../contexts/Notification";
import { motion, AnimatePresence } from "framer-motion";
import Loader from '../../contexts/Loader';
import { useSocket } from "../../contexts/SocketProvider";

import { 
  FiClock, 
  FiDollarSign, 
  FiCheck, 
  FiX, 
  FiInfo, 
  FiPlus, 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2,
  FiFrown,
  FiLoader,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const allowedStatuses = ["requested", "quoted", "approved", "rejected"];

const statusColor = {
  requested: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusIcon = {
  requested: <FiClock className="inline mr-1" />,
  quoted: <FiDollarSign className="inline mr-1" />,
  approved: <FiCheck className="inline mr-1" />,
  rejected: <FiX className="inline mr-1" />,
};

export default function UserQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [quotesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("newest");
  const navigate = useNavigate();
    const { socket } = useSocket();
  const dropdownRefs = useRef({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });

  const showTempNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && 
            !dropdownRefs.current[key].contains(event.target) && 
            openDropdown === key) {
          setOpenDropdown(null);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const fetchQuotations = () => {
    setIsLoading(true);
    getQuotationsByuser()
      .then(res => {
        const all = res.data || [];
        const filtered = all.filter(q =>
          allowedStatuses.includes(q.status?.toLowerCase())
        );
        setQuotes(filtered);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    
    fetchQuotations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add socket event listeners
  useEffect(() => {
    if (!socket) return;

    const events = [
      "quotation:requested",
      "quotation:raised",
      "quotation:decision",
      "quotation:ongoing",
      "quotation:completed",
      "quotation:userUpdated",
      "quotation:rejected",
      "quotation:hour-updated",
    ];

    const eventHandlers = events.map(event => {
      const handler = () => {
        fetchQuotations();
        // Show a subtle notification when data updates
        showTempNotification("Quotations updated", "info");
      };
      socket.on(event, handler);
      return { event, handler };
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        socket.off(event, handler);
      });
    };
  }, [socket]);

  // Filter quotes based on status
  const filteredQuotes = quotes.filter(q =>
    statusFilter === "all" ? true : q.status?.toLowerCase() === statusFilter
  );

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

  const handleDelete = async (quoteId) => {
    try {
      await deleteQuote(quoteId);
      showTempNotification("Quote deleted successfully!");
      setQuotes(quotes.filter(q => q._id !== quoteId));
      setOpenDropdown(null);
      setShowDeleteModal(false);
      // Reset to first page if current page becomes empty
      if (currentQuotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      showTempNotification("Failed to delete quote", "error");
    }
  };

  const toggleDropdown = (quoteId) => {
    setOpenDropdown(openDropdown === quoteId ? null : quoteId);
  };

  const openDeleteConfirmation = (quoteId) => {
    setQuoteToDelete(quoteId);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Quote</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this quote? This action cannot be undone.</p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(quoteToDelete)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
            <p className="text-gray-500 mt-1">
              Track and manage all your quotation requests
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {allowedStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    statusFilter === status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {capitalize(status)}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-lg">
          {isLoading ? (
            <Loader />
          ) : filteredQuotes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentQuotes.map((q) => (
                      <tr key={q._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                              {q.projectName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{q.projectName}</div>
                              <div className="text-sm text-gray-500">#CSC{q._id.slice(-6).toUpperCase()}</div>
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
                          <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusColor[q.status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
                            {statusIcon[q.status?.toLowerCase()] || <FiInfo className="inline mr-1" />} {capitalize(q.status)}
                          </span>
                          { q.status === "requested" && (
                              <span className="block text-sm mt-2 ml-1">Please wait for admin to respond.</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/app/quotes/${q._id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors relative top-[-5px] duration-200"
                          >
                            {q.status === "requested" ? "View Quote" : "Details"}
                          </button>
                          <div 
                            className="relative inline-block text-left"
                            ref={el => dropdownRefs.current[q._id] = el}
                          >
                            {q.status?.toLowerCase() === "requested" && (
                              <button 
                                onClick={() => toggleDropdown(q._id)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                              >
                                <FiMoreVertical className="w-5 h-5" />
                              </button>
                            )}
                            
                            {q.status?.toLowerCase() === "requested" && openDropdown === q._id && (
                              <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white focus:outline-none z-10">
                                <div className="py-1">
                                  {/* <button
                                    onClick={() => {
                                      navigate(`/app/edit-quote/${q._id}`);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  >
                                    <FiEdit2 className="mr-2" /> Edit
                                  </button> */}
                                  <button
                                    onClick={() => openDeleteConfirmation(q._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-900"
                                  >
                                    <FiTrash2 className="mr-2" /> Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                    Showing <span className="font-medium">{indexOfFirstQuote + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastQuote, sortedQuotes.length)}
                    </span>{" "}
                    of <span className="font-medium">{sortedQuotes.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md border ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
                      className={`p-2 rounded-md border ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <FiFrown className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No quotations found</h3>
              <p className="mt-1 text-gray-500">
                {statusFilter === "all" 
                  ? "You haven't created any quotations yet."
                  : `No quotations with status "${capitalize(statusFilter)}" found.`}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/app/request-quote")} 
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Quotation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
