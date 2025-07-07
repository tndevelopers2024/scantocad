import React from "react";
import InfoIcon from "../UI/InfoIcon";

const Deliverables = ({
  technicalInfo,
  deliverables,
  setDeliverables,
  selectedSoftware,
  setSelectedSoftware,
  selectedVersion,
  setSelectedVersion,
  errors,
  setErrors,
  SOFTWARE_OPTIONS,
}) => {
  const handleSoftwareChange = (e) => {
    const selected = e.target.value;
    setSelectedSoftware(selected);
    setSelectedVersion("");
    
    // Update deliverables format based on selection
    const format = selected 
      ? (selectedVersion ? `${selected}-${selectedVersion}` : selected)
      : "";
    
    setDeliverables({
      ...deliverables,
      liveTransferFormat: format,
    });
    
    setErrors((prev) => ({
      ...prev,
      liveTransferFormat: "",
    }));
  };

  const handleVersionChange = (e) => {
    const version = e.target.value;
    setSelectedVersion(version);

    // Update deliverables format
    const format = selectedSoftware 
      ? (version ? `${selectedSoftware}-${version}` : selectedSoftware)
      : "";
    
    setDeliverables({
      ...deliverables,
      liveTransferFormat: format,
    });
    
    setErrors((prev) => ({
      ...prev,
      liveTransferFormat: "",
    }));
  };

  return (
    <>
      <span className="block text-md font-medium text-gray-700 mb-2">
        Live.transfer format (Optional)
      </span>

      {technicalInfo.designIntent && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Software Selection (Optional) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Software (Optional)
              </label>
              <select
                value={selectedSoftware}
                onChange={handleSoftwareChange}
                className="w-full appearance-none bg-white border border-gray-300 text-gray-800 px-4 py-2 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1]"
              >
                <option value="">None selected</option>
                {Object.entries(SOFTWARE_OPTIONS).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Version Selection (Optional if software selected) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version {selectedSoftware && "(Optional)"}
              </label>
              <select
                value={selectedVersion}
                onChange={handleVersionChange}
                disabled={!selectedSoftware}
                className={`w-full appearance-none bg-white px-4 py-2 pr-10 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1] ${
                  !selectedSoftware
                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-300"
                }`}
              >
                <option value="">
                  {selectedSoftware ? "None selected" : "Select software first"}
                </option>
                {selectedSoftware &&
                  SOFTWARE_OPTIONS[selectedSoftware]?.versions.map((version) => (
                    <option key={version} value={version}>
                      {version}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.liveTransferFormat && (
            <p className="mt-1 text-sm text-red-600">
              {errors.liveTransferFormat}
            </p>
          )}
        </div>
      )}

      {/* Additional Options */}
      <div className="flex flex-wrap gap-4 mt-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={deliverables.cadNeutralFiles}
            onChange={(e) =>
              setDeliverables({
                ...deliverables,
                cadNeutralFiles: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700 text-sm">CAD neutral files</span>
          <InfoIcon infoText="Export files in neutral formats like STEP, IGES that can be opened in any CAD software." />
        </label>

        {(technicalInfo.designIntent || technicalInfo.hybridModelling) && (
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={deliverables.caddraftfiles}
              onChange={(e) =>
                setDeliverables({
                  ...deliverables,
                  caddraftfiles: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-gray-700 text-sm">2D Drafting (.dwg)</span>
            <InfoIcon infoText="Include 2D technical drawings with dimensions and annotations in DWG format." />
          </label>
        )}
      </div>
    </>
  );
};

export default Deliverables;