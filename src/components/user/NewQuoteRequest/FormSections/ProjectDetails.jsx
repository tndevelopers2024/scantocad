import React from "react";

const ProjectDetails = ({ formData, errors, handleInputChange }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project name
        </label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleInputChange}
          required
          className={`mt-1 w-full px-4 py-2 border ${
            errors.projectName ? "border-red-500" : "border-gray-300"
          } rounded-md focus:ring-blue-400 focus:border-blue-400`}
        />
        {errors.projectName && (
          <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Enter project description or special notes..."
          className={`mt-1 w-full px-4 py-2 border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } rounded-md focus:ring-blue-400 focus:border-blue-400`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
    </>
  );
};

export default ProjectDetails;