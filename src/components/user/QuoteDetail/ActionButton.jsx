import React from 'react';

const ActionButton = ({ children, onClick, disabled, variant, icon }) => {
  const variants = {
    success: "bg-green-600 hover:bg-green-700",
    danger: "bg-red-600 hover:bg-red-700",
    primary: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${variants[variant]} focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'success' ? 'focus:ring-green-500' : variant === 'danger' ? 'focus:ring-red-500' : 'focus:ring-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default ActionButton;