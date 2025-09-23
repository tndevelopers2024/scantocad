import React, { useState } from "react";
import { FiUploadCloud, FiArrowRight, FiTrash2, FiX } from "react-icons/fi";
import FileViewer from "./FileViewer";

const UploadPopup = ({
  onFileChange,
  onContinue,
  error,
  step,
  selectedFiles,
  onReviewComplete,
  onAddMoreFiles,
  currentFileIndex,
  onNavigateFile,
  onToggleFullScreen,
  onRemoveFile,
  onClose, // ✅ Passed from parent
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = {
        target: {
          files: files,
        },
      };
      onFileChange(event);
    }
  };

  if (step === 0) {
    return (
      <div
        style={{
          background: "url(/img/banner/upload.png)",
          backgroundColor: "#fff",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="fixed inset-0 bg-white m-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-md relative">
          {/* ✅ Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />
          </button>

          <div className="p-12 text-center">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">
              Upload Files
            </h3>
            <p className="text-gray-600 mb-6">
              Documents uploaded here will be stored in drive
            </p>

            <label
              htmlFor="initial-files-upload"
              className={`flex flex-col items-center justify-center h-48 border-2 border-dashed ${
                error
                  ? "border-red-500"
                  : isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-300"
              } rounded-lg cursor-pointer hover:bg-blue-50 transition mb-4`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FiUploadCloud className="text-4xl text-blue-400 mb-3" />
              <span className="text-lg text-blue-500 font-medium">
                {isDragging
                  ? "Drop files here"
                  : "Click to Upload or drag and drop"}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                Supported format: .stl .ply .obj
              </span>
              <input
                id="initial-files-upload"
                type="file"
                multiple
                accept=".stl,.ply,.obj"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
            {error && (
              <p className="mt-1 text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={onContinue}
                disabled={selectedFiles.length === 0}
                className={`px-6 py-2 rounded-md font-medium ${
                  selectedFiles.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Continue <FiArrowRight className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div
        style={{
          background: "url(/img/banner/upload.png)",
          backgroundColor: "#fff",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="fixed inset-0 overflow-y-scroll bg-white px-26 py-20 bg-opacity-50 flex gap-8 items-center justify-center z-50 m-0"
      >
        <div className="bg-white shadow rounded-lg overflow-hidden w-[50%] relative">
          {/* ✅ Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />
          </button>

          <div className="p-8">
            <div className="flex mb-6 justify-center">
              <label
                htmlFor="initial-files-upload"
                className={`cursor-pointer px-6 py-2 text-center grid place-items-center gap-3 border-dashed border-2 ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                } bg-[#F5EFFD] rounded-md font-medium text-gray-700 hover:bg-gray-50`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <img className="w-8" src="/img/icon/upload.png" alt="" />
                {isDragging ? "Drop files here" : "Add More Files"}
                <input
                  id="initial-files-upload"
                  type="file"
                  multiple
                  accept=".stl,.ply,.obj"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </div>

            <p className="text-md inline border-b-[1px] font-medium text-gray-700">
              {selectedFiles.length} Files
            </p>
            <div className="max-h-96 flex gap-5 overflow-y-auto mt-2">
              <ul className="w-full space-y-3">
                {selectedFiles.map((file, index) => (
                  <li
                    key={file.name + index}
                    onClick={() => onNavigateFile(index)}
                    className={`p-3 rounded-lg cursor-pointer 
                    ${
                      currentFileIndex === index
                        ? "border-2 border-[#5D01F2] bg-[#F3F3F3]"
                        : "bg-[#fff]"
                    } 
                    hover:bg-gray-100`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(file.size / 1024 / 1024)} MB
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateFile(index);
                          }}
                          className="text-[#155DFC] hover:text-blue-700"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-[50%] h-full inline-grid gap-5 place-items-end ">
          <FileViewer
            files={selectedFiles}
            currentIndex={currentFileIndex}
            onNavigate={onNavigateFile}
            onToggleFullScreen={onToggleFullScreen}
            fullScreen={false}
            firstFile="true"
          />
          <button
            onClick={onReviewComplete}
            disabled={selectedFiles.length === 0}
            className={`px-6 py-2 rounded-md mb-6 font-medium text-white hover:bg-blue-700
            ${
              selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600"
            }`}
          >
            Continue to Form <FiArrowRight className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default UploadPopup;
