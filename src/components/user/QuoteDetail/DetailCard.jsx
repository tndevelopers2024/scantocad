import React from 'react';

const DetailCard = ({ title, icon, children, className = "" }) => (
  <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="ml-2 font-medium text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

export default DetailCard;