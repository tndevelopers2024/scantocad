import React from "react";
import InfoIcon from "../UI/InfoIcon";

const TechnicalInfo = ({ technicalInfo, setTechnicalInfo, errors, setErrors }) => {
  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Technical Information
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={technicalInfo.designIntent}
            onChange={(e) => {
              const newTechInfo = {
                ...technicalInfo,
                designIntent: e.target.checked,
              };
              setTechnicalInfo(newTechInfo);
              setErrors((prev) => ({
                ...prev,
                technicalInfo: "",
              }));
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700 text-sm">Design Intent</span>
          <InfoIcon infoText="We rebuild the original design by applying dimensions and constraints, ignoring manufacturing errors. This approach is suited for new product development and allows easy edits in CAD software, keeping design history intact." />
        </label>

        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={technicalInfo.hybridModelling}
            onChange={(e) => {
              setTechnicalInfo({
                ...technicalInfo,
                hybridModelling: e.target.checked,
              });
              setErrors((prev) => ({
                ...prev,
                technicalInfo: "",
              }));
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700 text-sm">Hybrid Modelling</span>
          <InfoIcon infoText="We use a mix of as-built/design intent for prismatic shapes and NURBS for organic ones. This method suits parts with both freeform and geometric shapes, allowing accurate CAD conversion and flexible editing in reverse engineering tools." />
        </label>

        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={technicalInfo.scansToNURBS}
            onChange={(e) => {
              setTechnicalInfo({
                ...technicalInfo,
                scansToNURBS: e.target.checked,
              });
              setErrors((prev) => ({
                ...prev,
                technicalInfo: "",
              }));
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700 text-sm">Scans to NURBS</span>
          <InfoIcon infoText="We turn scan data into smooth, accurate NURBS surfaces, ideal for organic shapes. Edits can only be made in reverse engineering software, and files are exportable in formats like IGES or STEP for further use." />
        </label>

        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={technicalInfo.asBuildModelling}
            onChange={(e) => {
              setTechnicalInfo({
                ...technicalInfo,
                asBuildModelling: e.target.checked,
              });
              setErrors((prev) => ({
                ...prev,
                technicalInfo: "",
              }));
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700 text-sm">As-Build Modelling</span>
          <InfoIcon infoText="We create CAD models that exactly match the scanned object, including any manufacturing errors. This method ensures high accuracy and is ideal for replacing existing parts. The final model can be exported for manufacturing or mold development and edited in Geomagic Design X." />
        </label>
      </div>
      {errors.technicalInfo && (
        <p className="mt-1 text-sm text-red-600">{errors.technicalInfo}</p>
      )}
    </div>
  );
};

export default TechnicalInfo;