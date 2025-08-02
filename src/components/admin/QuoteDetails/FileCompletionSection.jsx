import React, { useState } from "react";
import {
  FiUpload,
  FiCheck,
  FiX,
  FiDownload,
  FiPaperclip,
} from "react-icons/fi";
import { completeQuotation } from "../../../api";

const FileCompletionSection = ({ files, quotationId, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [completedQuotationFile, setCompletedQuotationFile] = useState(null);
  const handleFileSelect = (fileId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setError(`File ${file.name} exceeds 1GB limit`);
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [fileId]: file,
    }));
    setError(null);
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles((prev) => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
  };

  const handleBulkUpload = async () => {
    if (Object.keys(selectedFiles).length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const completedFiles = Object.values(selectedFiles);

      await completeQuotation(
        quotationId,
        completedFiles,
        completedQuotationFile,
        {
          onUploadProgress: (percent) => setUploadProgress(percent),
        }
      );

      setSelectedFiles({});
      setSuccessMessage("Files uploaded successfully!");
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Bulk upload failed:", err);
      setError(
        err.details ||
          err.userMessage ||
          "Failed to upload files. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getAbsoluteUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http")) return path;
    return `https://ardpgimerchd.org${path}`;
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Complete Project Files</h3>

      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => {
              const originalName =
                typeof file.originalFile === "string"
                  ? file.originalFile.split("/").pop()
                  : file.originalFile?.name || "N/A";

              const completedFileUrl =
                typeof file.completedFile === "string"
                  ? file.completedFile
                  : file.completedFile?.url;

              const completedFileName = completedFileUrl
                ? completedFileUrl.split("/").pop()
                : "";

              return (
                <tr key={file._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPaperclip className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-4 text-sm font-medium text-gray-900">
                        {originalName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        file.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {file.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {completedFileUrl ? (
                      <a
                        href={getAbsoluteUrl(completedFileUrl)}
                        download
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FiDownload className="mr-1" />
                        Download
                        {completedFileName}
                      </a>
                    ) : selectedFiles[file._id] ? (
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">
                          {selectedFiles[file._id].name}
                        </span>
                        <button
                          onClick={() => handleRemoveFile(file._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      "Not uploaded yet"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {file.status !== "completed" && (
                      <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded-md inline-flex items-center hover:bg-blue-100 transition-colors">
                        <FiUpload className="mr-1" />
                        Select File
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileSelect(file._id, e)}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="w-56 mt-6">
        <label
          htmlFor="completedQuotationFile"
          className="cursor-pointer flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 hover:border-blue-500 hover:bg-blue-50 transition text-sm text-gray-700"
        >
          <FiUpload className="text-blue-600 text-lg" />
          <span>{completedQuotationFile?.name || "Upload Invoice"}</span>
        </label>
        <input
  id="completedQuotationFile"
  type="file"
  accept=".pdf, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  onChange={(e) => setCompletedQuotationFile(e.target.files[0])}
  className="hidden"
/>

      </div>

      {/* Bulk Upload Section */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {Object.keys(selectedFiles).length} file(s) selected for upload
          </p>
          <button
            onClick={handleBulkUpload}
            disabled={
              isUploading || Object.keys(selectedFiles).length !== files.length
            }
            className={`px-4 py-2 rounded-md flex items-center ${
              isUploading
                ? "bg-blue-400 text-white"
                : Object.keys(selectedFiles).length === files.length
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="mr-1" />
                Upload All Selected
              </>
            )}
          </button>
        </div>

        {isUploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {uploadProgress}% Complete
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-500 text-sm rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-2 bg-green-50 text-green-600 text-lg font-semibold rounded flex items-center">
            <FiCheck className="mr-2" />
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCompletionSection;
