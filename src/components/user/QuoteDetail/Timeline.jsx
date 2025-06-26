import React from 'react';
import { motion } from 'framer-motion';
import { FiFile, FiMail, FiCheck, FiDownload, FiUser, FiX } from 'react-icons/fi';

const HorizontalTimeline = ({ status }) => {
  const showDecisionStep =
    status === 'approved'
      ? [{ id: 'approved', title: 'Accept Quote', icon: <FiCheck />, description: 'Quote approved' }]
      : status === 'rejected'
      ? [{ id: 'rejected', title: 'Reject Quote', icon: <FiX />, description: 'Quote rejected' }]
      : [{ id: 'approved', title: 'Accept or Reject Quote', icon: <FiCheck />, description: 'Quote approved or rejected' }];

  const steps = [
    { id: 'requested', title: 'Quote Requested', icon: <FiFile />, description: 'Project request submitted' },
    { id: 'quoted', title: 'Receive Quotation', icon: <FiMail />, description: 'Quote shared by Admin' },
    ...showDecisionStep,
    { id: 'ongoing', title: 'Work in Progress', icon: <FiUser />, description: 'Quote in progress' },
    ...(status === 'reported'
      ? [{ id: 'reported', title: 'issue reported', icon: <FiMail />, description: 'Quote has been reported' }]
      : []),
    { id: 'completed', title: 'Receive Files', icon: <FiDownload />, description: 'CAD file delivered' },
  ];

  const currentIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="flex items-start justify-between w-full">
      {steps.map((step, idx) => {
        const isCurrent = idx === currentIndex;
        const isComplete = idx < currentIndex;
        const isRejected = step.id === 'rejected';

        return (
          <div key={step.id} className="flex flex-col items-center relative flex-1">
            {/* Step icon */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full ${
                isRejected
                  ? 'bg-red-600 text-white'
                  : isCurrent || isComplete
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={
                isCurrent && !isRejected
                  ? { boxShadow: '0 0 0 4px rgba(59,130,246,0.3)' }
                  : {}
              }
            >
              {step.icon}
              {isCurrent && !isRejected && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Step title and description */}
            <div className="mt-2 text-center">
              <h4
                className={`font-medium capitalize ${
                  isRejected ? 'text-gray-900' : isCurrent || isComplete ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
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
