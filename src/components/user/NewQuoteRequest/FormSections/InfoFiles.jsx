import React from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

const InfoFiles = ({
  infoFiles,
  handleInfoFilesChange,
  removeInfoFile,
  errors,
  ALLOWED_INFO_FILE_EXTENSIONS,
}) => {
  return (
    <div>
      <label className="block mb-3 text-sm font-medium text-gray-700">
        Upload Bill of materials and technical data (Optional)
      </label>
      <label
        htmlFor="info-files-upload"
        className={`flex flex-col items-center justify-center h-32 border-2 border-dashed ${
          errors.infoFiles ? "border-red-500" : "border-blue-300"
        } rounded-lg cursor-pointer hover:bg-blue-50 transition`}
      >
        <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
        <span className="text-sm text-blue-500">
          Click here to upload your file
        </span>
        <span className="text-xs text-gray-500">
          {ALLOWED_INFO_FILE_EXTENSIONS.map(ext => `.${ext}`).join(", ")}
        </span>
        <input
          id="info-files-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleInfoFilesChange}
        />
      </label>
      {errors.infoFiles && (
        <p className="mt-1 text-sm text-red-600">{errors.infoFiles}</p>
      )}

      {infoFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
          <ul className="space-y-2">
            {infoFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {file.name} ({Math.round(file.size / 1024 / 1024)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => removeInfoFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfoFiles;