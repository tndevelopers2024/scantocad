import React from 'react';
import { FiXCircle } from 'react-icons/fi';

const NotFoundMessage = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center p-6">
    <div className="bg-red-100 p-4 rounded-full mb-4">
      <FiXCircle className="h-8 w-8 text-red-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
    <p className="text-gray-600 max-w-md">
      The quote you're looking for doesn't exist or you don't have permission to view it.
    </p>
  </div>
);

export default NotFoundMessage;