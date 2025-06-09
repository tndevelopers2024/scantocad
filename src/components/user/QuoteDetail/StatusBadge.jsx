import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    requested: "bg-yellow-100 text-yellow-800",
    quoted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    ongoing: "bg-indigo-100 text-indigo-800",
    completed: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;