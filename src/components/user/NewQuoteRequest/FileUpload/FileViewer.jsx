import React from "react";
import STLViewer from "../../../../contexts/STLViewer";
import { FiArrowLeft, FiArrowRight, FiMaximize, FiMinimize } from "react-icons/fi";

const FileViewer = ({
  files,
  currentIndex,
  onNavigate,
  onToggleFullScreen,
  fullScreen,
  firstFile,
}) => {
  if (files.length === 0) return null;

  const handleNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(direction);
  };

  const handleFullScreenToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFullScreen();
  };

  return (
    <div className={`border ${fullScreen ? "w-full" : "w-full bg-white"} border-gray-200 rounded-lg p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Model View</h3>
        <div className="flex space-x-2">
          {files.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => handleNavigation("prev", e)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <FiArrowLeft />
              </button>
              <button
                type="button"
                onClick={(e) => handleNavigation("next", e)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <FiArrowRight />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleFullScreenToggle}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            {fullScreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>
      <div
        className={`${
          fullScreen ? "h-[80vh]" : firstFile ? "h-[350px]" : "h-64"
        } bg-gray-100 rounded overflow-hidden border border-gray-300`}
      >
        <STLViewer file={files[currentIndex]} />
      </div>
      <div className="mt-2 text-sm text-gray-700 truncate">
        {files[currentIndex].name}
      </div>
    </div>
  );
};

export default FileViewer;