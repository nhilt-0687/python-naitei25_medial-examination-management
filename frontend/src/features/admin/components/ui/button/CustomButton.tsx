import React from "react";

interface CustomButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  textColor?: string;
  bgColor?: string;
  hoverBgColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onClick,
  icon,
  label,
  textColor = "text-sky-700",
  bgColor = "bg-sky-100",
  hoverBgColor = "hover:bg-blue-200",
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-1 text-xs font-medium rounded-md transition-colors ${textColor} ${bgColor} ${hoverBgColor}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default CustomButton;