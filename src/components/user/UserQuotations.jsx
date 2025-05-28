import React, { useEffect, useState } from "react";
import { getQuotationsByuser } from "../../api";
import { useNavigate } from "react-router-dom";

const allowedStatuses = ["requested","quoted","approved","rejected"];

const statusColor = {
  requested: "bg-yellow-100 text-yellow-800",
  quoted:    "bg-blue-100   text-blue-800",
  approved:  "bg-green-100  text-green-800",
  rejected:  "bg-red-100    text-red-800",
};

const statusIcon = {
  requested: "🕒",
  quoted:    "💰",
  approved:  "✅",
  rejected:  "❌",
};

export default function UserQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    getQuotationsByuser()
      .then(res => {
        const all = res.data || [];
        // keep only our allowed statuses
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
  }, []);

  const filteredQuotes = quotes.filter(q =>
    statusFilter === "all"
      ? true
      : q.status?.toLowerCase() === statusFilter
  );

  return (
 <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
            <p className="text-gray-500 mt-1">
              Track and manage all your quotation requests
            </p>
          </div>

          {/* Filter */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
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
                onClick={() => setStatusFilter(status)}
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
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredQuotes.length > 0 ? (
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
                  {filteredQuotes.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                            {q.projectName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{q.projectName}</div>
                            <div className="text-sm text-gray-500">#{q._id.slice(-6).toUpperCase()}</div>
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
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor[q.status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
                          {statusIcon[q.status?.toLowerCase()] || "ℹ️"} {capitalize(q.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/quotes/${q._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                        >
                          {q.status === "requested" ? "View Quote" : "Details"}
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No quotations found</h3>
              <p className="mt-1 text-gray-500">
                {statusFilter === "all" 
                  ? "You haven't created any quotations yet."
                  : `No quotations with status "${capitalize(statusFilter)}" found.`}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/new-quote")} 
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
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
