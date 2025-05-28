import React from 'react';
import { motion } from 'framer-motion';
import { FiFile, FiMail, FiCheck, FiDownload, FiUser } from 'react-icons/fi';

const HorizontalTimeline = ({ status }) => {
  const steps = [
    { id: "requested", title: "Request quote", icon: <FiFile />, description: "Project request submitted" },
    { id: "quoted", title: "Receive Quotation", icon: <FiMail />, description: "Quote details sent" },
    { id: "approved", title: "Accept Quote", icon: <FiCheck />, description: "Quote approved" },
    { id: "ongoing", title: "Quote Progress", icon: <FiUser />, description: "Quote in progress" },
    { id: "completed", title: "Receive Files", icon: <FiDownload />, description: "Final files delivered" },
  ];

  const currentIndex = steps.findIndex(step => step.id === status);

  return (
    <div className="flex items-start justify-between w-full">
      {steps.map((step, idx) => {
        const isOngoing = idx === currentIndex;
        const isComplete = idx < currentIndex;

        return (
          <div key={step.id} className="flex flex-col items-center relative flex-1">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300 ${
                isOngoing
                  ? 'bg-blue-100 text-blue-600'
                  : isComplete
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={isOngoing ? { boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)' } : {}}
            >
              {step.icon}
              {isOngoing && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Title and description */}
            <div className="mt-2 text-center">
              <h4 className={`${isComplete || isOngoing ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
                {step.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute top-5 right-0 h-1 ${
                  idx < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                style={{ width: '100%', left: '50%' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalTimeline;
