import React from "react";
import STLViewer from "../../../../contexts/STLViewer";
import { FiArrowLeft, FiArrowRight, FiMinimize } from "react-icons/fi";

const FullScreenViewer = ({
  files,
  currentIndex,
  onNavigate,
  onClose,
  onRemoveFile,
}) => {
  if (!files.length) return null;

  const handleNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(direction);
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
          <h4 className="text-lg font-semibold">
            {files[currentIndex].name} ({currentIndex + 1} of {files.length})
          </h4>
          <div className="flex space-x-4 items-center">
            {files.length > 1 && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleNavigation("prev", e)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <FiArrowLeft />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleNavigation("next", e)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <FiArrowRight />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              <FiMinimize />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-black">
          <STLViewer file={files[currentIndex]} />
        </div>
      </div>
    </div>
  );
};

export default FullScreenViewer;