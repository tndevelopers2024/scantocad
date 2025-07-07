import React from "react";
import { FiUploadCloud } from "react-icons/fi";

const UploadSection = ({
  setShowUploadPopup,
  errors,
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        Upload files
      </label>
      <div
        className="text-center py-8 border-2 border-dashed border-blue-500 rounded-lg"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <button
          onClick={() => setShowUploadPopup(true)}
          className="px-6 py-3 w-full text-center grid text-blue-500 rounded-md font-lg"
        >
          <FiUploadCloud className="inline m-auto" />
          {isDragging ? "Drop files here" : "Browse your files"}
        </button>
      </div>
      {errors.files && (
        <p className="mt-2 text-sm text-red-600">{errors.files}</p>
      )}
    </div>
  );
};

export default UploadSection;