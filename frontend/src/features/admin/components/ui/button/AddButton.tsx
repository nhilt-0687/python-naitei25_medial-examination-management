import React from "react";

interface AddButtonProps {
  onClick?: () => void; 
  tooltip?: string; 
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, tooltip }) => {
  return (
    <div className="relative group">
      {/* Tooltip */}
      {tooltip && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {tooltip}
        </span>
      )}

      <button
        onClick={onClick}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-base-600 text-white shadow-lg shadow-base-400/30 shadow-b-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default AddButton;