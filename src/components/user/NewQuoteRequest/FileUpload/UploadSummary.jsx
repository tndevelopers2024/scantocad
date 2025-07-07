import React from "react";
import { FiTrash2 } from "react-icons/fi";

const UploadSummary = ({
  selectedFiles = [], // Provide default empty array
  setUploadStep,
  setShowUploadPopup,
  setCurrentFile,
  removeFile,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Files ({selectedFiles.length})
        </h3>
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
      </div>

      <div className="max-h-60 overflow-y-auto mb-4">
        {selectedFiles.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  File
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedFiles.map((file, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(file.size / 1024 / 1024)} MB
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
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
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-4">No files uploaded yet</p>
        )}
      </div>
    </div>
  );
};

export default UploadSummary;