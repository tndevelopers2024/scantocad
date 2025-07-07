import React from "react";

const ProgressLoader = ({ progress, message }) => {
  return (
    <div className="fixed inset-0 bg-white/80 bg-opacity-30 m-0 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      </div>

      {/* Progress percentage */}
      <div className="text-center text-sm text-gray-500">
        {progress}% complete
      </div>
      <p className="mt-4 w-[500px] text-center text-blue-800 text-2xl font-semibold">
        {message}
      </p>
    </div>
  );
};

export default ProgressLoader;