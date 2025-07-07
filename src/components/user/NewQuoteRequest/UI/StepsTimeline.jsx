import React from "react";

const StepsTimeline = ({ steps }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-6">
      Steps to Receive Your CAD File
    </h3>
    <div className="relative">
      <div
        className="absolute inset-0 top-[-20px] flex items-center"
        aria-hidden="true"
      >
        <div className="w-full border-t-2 border-dashed border-blue-200" />
      </div>

      <div className="relative flex justify-between space-x-4">
        {steps.map(({ label, icon: Icon }, idx) => (
          <div
            key={idx}
            className="flex time-lines flex-col items-center text-sm text-gray-700"
          >
            <div className="bg-white p-3 rounded-full shadow-md text-blue-600 text-xl">
              {Icon && <Icon />}
            </div>
            <span className="mt-2 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StepsTimeline;