import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

const UploadSummary = ({
  selectedFiles = [],
  fileLinks = [],
  setUploadStep,
  setShowUploadPopup,
  setCurrentFile,
  removeFile,
  removeFileLink,
  setFileLinks, // ✅ Required to update from here
}) => {
  const [newLink, setNewLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleAddLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed || !/^https?:\/\//.test(trimmed)) return;

    setFileLinks([...fileLinks, trimmed]);
    setNewLink("");
    setShowLinkInput(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Files ({selectedFiles.length + fileLinks.filter(link => link.trim() !== "").length})
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setUploadStep(0);
              setShowUploadPopup(true);
            }}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Add Files
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(true)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add Link
          </button>
        </div>
      </div>

      {/* Link Input Field */}
      {showLinkInput && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            className="w-full border px-3 py-2 rounded-md text-sm"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
            onClick={handleAddLink}
          >
            Add
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-red-500 text-sm"
            onClick={() => {
              setShowLinkInput(false);
              setNewLink("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="max-h-60 overflow-y-auto mb-4">
        {selectedFiles.length === 0 && fileLinks.every(link => link.trim() === "") ? (
          <p className="text-center text-gray-500 py-4">No files uploaded or linked yet</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File / Link
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Uploaded Files */}
              {selectedFiles.map((file, index) => (
                <tr key={`file-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">Upload</td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {Math.round(file.size / 1024 / 1024)} MB
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setCurrentFile(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Cloud Links */}
              {fileLinks
                .map((link, index) => link.trim() && ({ link, index }))
                .filter(Boolean)
                .map(({ link, index }) => (
                  <tr key={`link-${index}`} className="bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-blue-600 underline truncate max-w-xs">
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">Cloud Link</td>
                    <td className="px-3 py-2 text-sm text-gray-500">—</td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFileLink(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UploadSummary;
