import React, { useEffect, useState } from "react";
import { getQuotationsByuser } from "../../api";
import { useNavigate } from "react-router-dom";

const statusColor = {
  ongoing: "bg-indigo-100 text-indigo-800",
  completed: "bg-purple-100 text-purple-800",
};

const statusIcon = {
  ongoing: "🔄",
  completed: "🏁",
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function UserCompletedQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ongoing");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const filteredQuotes = quotes.filter(
    (q) => q.status?.toLowerCase() === statusFilter
  );

  return (
    <div className="p-6 min-h-screen">
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
            {["ongoing", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
                  statusFilter === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {statusIcon[status]} {capitalize(status)}
              </button>
            ))}
            {/* <button
              onClick={() => navigate("/my-quotations")}
              className="ml-4 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Active Quotes
            </button> */}
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : filteredQuotes.length > 0 ? (
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
                  {filteredQuotes.map((q) => (
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
                              #{q._id.slice(-6).toUpperCase()}
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
                            statusColor[q.status.toLowerCase()] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusIcon[q.status.toLowerCase()]}{" "}
                          {capitalize(q.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/quotes/${q._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                        >
                          Details
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                No{" "}
                {capitalize(statusFilter)} quotations available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
