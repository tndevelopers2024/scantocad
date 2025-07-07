import React from "react";
import { motion } from "framer-motion";

const Notification = ({ message, type, onClose }) => {
  const getNotificationStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "warning":
        return "bg-yellow-100 border-yellow-400 text-yellow-700";
      case "info":
        return "bg-blue-100 border-blue-400 text-blue-700";
      default:
        return "bg-green-100 border-green-400 text-green-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 border-l-4 px-4 py-3 rounded shadow-lg ${getNotificationStyles()}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="py-1">
          {type === "error" && (
            <svg
              className="fill-current h-6 w-6 text-red-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
            </svg>
          )}
          {type === "success" && (
            <svg
              className="fill-current h-6 w-6 text-green-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z" />
            </svg>
          )}
          {type === "info" && (
            <svg
              className="fill-current h-6 w-6 text-blue-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-1-5h2V9H9v6zm0-8h2V6H9v1z" />
            </svg>
          )}
          {type === "warning" && (
            <svg
              className="fill-current h-6 w-6 text-yellow-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-1-5h2V8H9v7zm0-9h2V6H9v1z" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="fill-current h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 8.586L14.95 3.636l1.414 1.414L11.414 10l5.95 5.95-1.414 1.414L10 11.414l-5.95 5.95-1.414-1.414L8.586 10 2.636 4.05l1.414-1.414L10 8.586z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default Notification;