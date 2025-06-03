import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const roleConfig = {
  company: {
    color: "bg-blue-100 text-blue-800",
    icon: "🏢",
  },
  user: {
    color: "bg-green-100 text-green-800",
    icon: "👤",
  },
  all: {
    color: "bg-gray-100 text-gray-800",
    icon: "👥",
  },
};

const roleList = ["all", "company", "user"];

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    setIsLoading(true);
    getAllUsers()
      .then((res) => {
        // Sort users by createdAt date in descending order (newest first)
        const sortedUsers = (res.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sortedUsers);
        setTotalCount(res.count);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const countByRole = (role) =>
    role === "all" ? users.length : users.filter(u => u.role === role).length;

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === "all" || u.role === roleFilter;

    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company?.name && u.company.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 mb-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">User Management</h1>
            <p className="text-blue-100 mt-1">
              {totalCount} total users 
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {roleList.slice(1).map((role) => (
            <InfoCard
              key={role}
              title={capitalize(role)}
              count={countByRole(role)}
              active={roleFilter === role}
              onClick={() => {
                setRoleFilter(role);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              config={roleConfig[role]}
            />
          ))}
          <InfoCard
            title="All Users"
            count={users.length}
            active={roleFilter === "all"}
            onClick={() => {
              setRoleFilter("all");
              setCurrentPage(1);
            }}
            config={roleConfig.all}
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        variants={fadeIn}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6 bg-white rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Role Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {roleList.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  roleFilter === role
                    ? `${roleConfig[role].color} shadow-inner`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {capitalize(role)}
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
              placeholder="Search by name, email, company, or phone..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
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
                  {currentUsers.length > 0 ? (
                    currentUsers.map((u, i) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {u.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u.Hours} Hours
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{u.email}</div>
                          <div className="text-sm text-gray-500">
                            {u.phone || "No phone"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {u.company?.name || "Individual"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {u.company?.industry || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                roleConfig[u.role]?.color ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {roleConfig[u.role]?.icon || "👤"} {capitalize(u.role)}
                            </span>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                u.isVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {u.isVerified ? "✅ Verified" : "⚠️ Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          
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
                            No users found
                          </h3>
                          <p className="mt-1">
                            {roleFilter !== "all"
                              ? `Try changing your filter or search query`
                              : "No users have been registered yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </span> of{" "}
                  <span className="font-medium">{filteredUsers.length}</span> results
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
                            ? "bg-blue-600 text-white"
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
      <span className="text-xl mr-2">{config?.icon || "👤"}</span>
      <div>
        <div className="text-xs text-gray-800 font-medium opacity-80">{title}</div>
        <div className="text-xl text-gray-800 font-bold">{count}</div>
      </div>
    </div>
  </motion.div>
);

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";