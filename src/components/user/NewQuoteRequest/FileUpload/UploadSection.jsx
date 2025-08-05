// 🎯 Full UploadSection with Upload/Link toggle option
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
  fileInputType,
  setFileInputType,
  fileLinks,
  setFileLinks,
  onLinkReviewComplete, // ✅ new prop
}) => {
  const handleLinkChange = (index, value) => {
    const updatedLinks = [...fileLinks];
    updatedLinks[index] = value;
    setFileLinks(updatedLinks);
  };

  const handleRemoveLink = (index) => {
    const updated = fileLinks.filter((_, i) => i !== index);
    setFileLinks(updated.length ? updated : [""]);
  };

  const isContinueDisabled = fileLinks.every((link) => link.trim() === "");

  return (
    <div>
      <div className="flex gap-4 items-center mb-3">
        <label className="text-sm font-medium text-gray-700">Upload method:</label>
        <button
          type="button"
          className={`px-3 py-1 rounded border text-sm ${
            fileInputType === "upload"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setFileInputType("upload")}
        >
          Upload
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded border text-sm ${
            fileInputType === "link"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setFileInputType("link")}
        >
          Link
        </button>
      </div>

      {fileInputType === "upload" ? (
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
              type="button"
            >
              <FiUploadCloud className="inline m-auto text-2xl mb-2" />
              {isDragging ? "Drop files here" : "Browse your files"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Cloud/Drive Links
          </label>
          <div className="space-y-3">
            {fileLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="url"
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  placeholder="https://drive.google.com/..."
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 text-xl"
                  onClick={() => handleRemoveLink(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              onClick={() => setFileLinks([...fileLinks, ""])}
            >
              + Add Another Link
            </button>
          </div>

          {/* ✅ Continue Button */}
          <div className="mt-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-white ${
                isContinueDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isContinueDisabled}
              onClick={onLinkReviewComplete}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {errors.files && (
        <p className="mt-2 text-sm text-red-600">{errors.files}</p>
      )}
    </div>
  );
};


export default UploadSection;
