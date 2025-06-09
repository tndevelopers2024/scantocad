// src/components/Loader.js
import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 bg-opacity-30 m-0 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p className="mt-4 w-[500px] text-center text-blue-800 text-2xl font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
