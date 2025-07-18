import React, { useEffect, useState } from "react";
import { getQuotations, getAllUsers } from "../../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../../contexts/SocketProvider";

// Enhanced status label styles with icons
const statusConfig = {
  requested: {
    color: "bg-yellow-100 text-yellow-800",
    icon: "⏳",
  },
  quoted: {
    color: "bg-blue-100 text-blue-800",
    icon: "📝",
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: "❌",
  },
  completed: {
    color: "bg-purple-100 text-purple-800",
    icon: "🏁",
  },
  ongoing: {
    color: "bg-orange-100 text-orange-800",
    icon: "🚧",
  },
  reported: {
    color: "bg-pink-100 text-pink-800",
    icon: "⚠️",
  },
  all: {
    color: "bg-gray-100 text-gray-800",
    icon: "📊",
  },
};

const statusList = ["all", "requested", "quoted", "approved", "rejected",  "ongoing", "reported" ,"completed"];
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
const { socket } = useSocket();

  const QUOTATIONS_PER_PAGE = 10;

const fetchQuotations = () => {
    setIsLoading(true);
    getQuotations()
      .then((res) => {
        const sortedQuotes = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setQuotes(sortedQuotes);
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

  // ✅ Socket event listener
  useEffect(() => {
    if (!socket) return;

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
      console.log("Quotation event received");
      fetchQuotations();
    };

    events.forEach((event) => {
      socket.on(event, handleUpdate);
    });

    return () => {
      events.forEach((event) => {
        socket.off(event, handleUpdate);
      });
    };
  }, [socket]);


  const countByStatus = (status) =>
    quotes.filter((q) => q.status?.toLowerCase() === status).length;

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus =
      statusFilter === "all" || q.status?.toLowerCase() === statusFilter;

    const matchesSearch =
      q.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredQuotes.length / QUOTATIONS_PER_PAGE);
  const indexOfLastQuote = currentPage * QUOTATIONS_PER_PAGE;
  const indexOfFirstQuote = indexOfLastQuote - QUOTATIONS_PER_PAGE;
  const currentQuotes = filteredQuotes.slice(indexOfFirstQuote, indexOfLastQuote);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header with Stats */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 mb-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quotation Dashboard</h1>
            <p className="text-indigo-100 mt-1">
              {quotes.length} total quotations 
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-7 gap-3">
          {statusList.slice(1).map((status) => (
            <InfoCard
              key={status}
              title={capitalize(status)}
              count={countByStatus(status)}
              active={statusFilter === status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              config={statusConfig[status]}
            />
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        variants={fadeIn}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6 bg-white rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {statusList.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status
                    ? `${statusConfig[status].color} shadow-inner`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                 {capitalize(status)}
              </button>
            ))}
          </div>

          {/* Search with icon */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects, customers, emails..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        variants={fadeIn}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentQuotes.length > 0 ? (
                    currentQuotes.map((q, i) => (
                      <motion.tr
                        key={q._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                              {indexOfFirstQuote + i + 1}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {q.projectName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(q.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{q.user?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{q.user?.email}</div>
                          <div className="text-sm text-gray-500">
                            {q.user?.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusConfig[q.status?.toLowerCase()]?.color ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusConfig[q.status?.toLowerCase()]?.icon || "📄"}{" "}
                            {capitalize(q.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/app/admin/quotes/${q._id}`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            {q.status === "requested" ? "Prepare Quote" : "View Details"}
                          </button>
                          {q.status === "quoted" && (
                            <button className="text-green-600 hover:text-green-900">
                              Send Reminder
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-lg font-medium">
                            No quotations found
                          </h3>
                          <p className="mt-1">
                            {statusFilter !== "all"
                              ? `Try changing your filter or search query`
                              : "No quotations have been created yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredQuotes.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{indexOfFirstQuote + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastQuote, filteredQuotes.length)}
                  </span> of{" "}
                  <span className="font-medium">{filteredQuotes.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded text-sm font-medium ${
                      currentPage === 1 
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                        : "text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 border rounded text-sm font-medium ${
                          currentPage === number
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded text-sm font-medium ${
                      currentPage === totalPages 
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                        : "text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

const InfoCard = ({ title, count, active, onClick, config }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-3 rounded-lg cursor-pointer transition-all ${
      active ? "bg-white bg-opacity-30 shadow-md" : "bg-white bg-opacity-10 hover:bg-opacity-20"
    }`}
  >
    <div className="flex items-center">
      <span className="text-xl mr-2">{config?.icon || "📊"}</span>
      <div>
        <div className="text-xs text-black font-medium opacity-80">{title}</div>
        <div className="text-xl text-black font-bold">{count}</div>
      </div>
    </div>
  </motion.div>
);

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";