import React from "react";
import { FiFile, FiTrash2 } from "react-icons/fi";

const FileCard = ({
  index,
  title,
  fileUrl,
  fileSourceType,
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

  const forceDownload = async (url, filename) => {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className={`border-b border-gray-200 py-3 px-2 text-sm ${className}`}>
      <div className="grid grid-cols-12 gap-3 items-center text-gray-700">
        {/* Index */}
        <div className="col-span-1 text-center">
          <div className="text-[#5D36F7] bg-[#E0E7FF] w-8 h-8 rounded-md flex items-center justify-center font-semibold">
            {quote.quotationFile?.length > 0 ? index + 1 : index}
          </div>
        </div>

        {/* File Name */}
        <div className="col-span-4 flex items-center">
          <FiFile className="text-gray-400 mr-2 text-lg w-[10%]" />
          <span className="truncate w-[90%]">{fileName}</span>
        </div>

        {/* Required Hours */}
        {quote.status !== "completed" && quote.requiredHour !== "" && (
          <div className="col-span-2 text-center text-gray-600">
            {requiredHour || ""}
          </div>
        )}

        {/* Actions */}
        <div
          className={`${
            quote.status === "completed" ? "col-span-6" : "col-span-5"
          } flex justify-end items-center gap-4`}
        >
          {previewable && (
            <button
              style={{ textDecoration: "none" }}
              onClick={onPreview}
              className="bg-blue-600 text-white p-1 rounded-sm hover:underline "
            >
              Preview
            </button>
          )}
         {fileSourceType === "cloud_link" ? (
          <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get Drive/Cloud Link
            </a>
          ) : (
              <button
              onClick={() => forceDownload(getAbsoluteUrl(fileUrl), fileName)}
              className="bg-blue-600 text-white p-1 rounded-sm hover:underline"
            >
              Download
            </button>
          )}

          {deletable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              <FiTrash2 />
            </button>
          )}

          {quote.status === "completed" && (
            <button
              style={{ textDecoration: "none" }}
              onClick={onReportIssue}
              className={`text-sm ${
                isReported
                  ? "bg-red-500 text-white p-1 rounded-sm"
                  : "bg-blue-600 text-white p-1 rounded-sm"
              } hover:underline`}
            >
              {isReported ? "Reported" : "Report Issue"}
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
  return `https://convertscantocad.in${path}`;
};

export default FileCard;
