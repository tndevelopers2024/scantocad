import React from "react";
import { FiFile, FiTrash2, FiDownload } from "react-icons/fi";

const FileCard = ({
  index,
  title,
  fileUrl,
  requiredHour,
  onDelete,
  deletable,
  onPreview,
  previewable = false,
  className = "",
  onReportIssue,
  isReported,
  quote = {},
}) => {
  const fileName = fileUrl?.split("/").pop() || "No file";

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="grid grid-cols-5 gap-4 items-center text-sm text-gray-700">
        {/* Index */}
        <div className="font-md font-semibold rounded-md text-[#5D36F7] bg-[#E0E7FF] w-8 h-8 flex items-center justify-center">{index + 1}</div>

        {/* File Info */}
        <div className="flex items-center col-span-2">
          <FiFile className="text-gray-400 mr-2 w-6" />
          <span className="truncate">{fileName}</span>
        </div>

        {/* Required Hour */}
        <div className={`text-gray-500 ${quote.status === "completed" ? 'hidden' : 'col-span-1'} text-center`}>{requiredHour || ""}</div>

        {/* Actions */}
        <div className={`flex items-center ${quote.status === "completed" ? 'col-span-2' : 'col-span-1'} space-x-3 justify-end`}>
          {previewable && (
            <button
              onClick={onPreview}
              className="text-blue-600 hover:text-blue-800"
            >
              Preview
            </button>
          )}

          <a
            href={getAbsoluteUrl(fileUrl)}
            download
            className="text-blue-600 hover:text-blue-800"
            title="Download file"
          >
            Download
          </a>

          {deletable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete file"
            >
              <FiTrash2 />
            </button>
          )}

           {quote.status === "completed" &&(
        <button
          onClick={onReportIssue}
          className={`   text-sm ${isReported ? 'text-red-500' : 'text-blue-500'} hover:underline`}
        >
          {isReported ? 'Reported' : 'Report Issue'}
        </button>
      )}
        </div>
      </div>
    </div>
  );
};

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://ardpgimerchd.org${path}`;
};

export default FileCard;
