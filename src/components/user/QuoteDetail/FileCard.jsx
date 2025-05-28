import React from 'react';
import { FiFile } from 'react-icons/fi';

const FileCard = ({ title, fileUrl, onPreview, previewable = false, className = "" }) => {
  const fileName = fileUrl?.split("/").pop() || "No file";
  
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FiFile className="text-gray-400 mr-2" />
          <span className="truncate max-w-xs">{fileName}</span>
        </div>
        <div className="flex space-x-2">
          {previewable && (
            <button
              onClick={onPreview}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Preview
            </button>
          )}
          <a
            href={getAbsoluteUrl(fileUrl)}
            download
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://5000-firebase-scantocadbackendgit-1747203690155.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev${path}`;
};

export default FileCard;