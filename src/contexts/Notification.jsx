// components/Notification.js
import { motion } from "framer-motion";
import { FiCheck, FiX, FiXCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

const Notification = ({ message, type = "success", onClose }) => {
  const config = {
    success: {
      icon: <FiCheck className="mr-2" />,
      bgColor: "bg-green-500",
    },
    error: {
      icon: <FiXCircle className="mr-2" />,
      bgColor: "bg-red-500",
    },
    info: {
      icon: <FiInfo className="mr-2" />,
      bgColor: "bg-blue-500",
    },
    warning: {
      icon: <FiAlertTriangle className="mr-2" />,
      bgColor: "bg-yellow-500",
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed bottom-6 left-6 z-50 p-4 rounded-md shadow-lg ${config[type].bgColor} text-white flex items-center`}
    >
      {config[type].icon}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        <FiX />
      </button>
    </motion.div>
  );
};

export default Notification;