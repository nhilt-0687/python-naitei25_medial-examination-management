interface InfoFieldProps {
  label?: string;
  value: string | number | React.ReactNode;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  className = "",
  labelClassName = "",
  contentClassName = "",
}) => {
  return (
    <div className={`grid grid-cols-6 gap-4 ${className}`}>
      {label && (
        <p className={`col-span-2 text-md font-semibold text-gray-800 ${labelClassName}`}>
          {label}:
        </p>
      )}
      <div className="col-span-4 p-3 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed hover:bg-gray-50/30">
        <p className={`text-gray-800 ${contentClassName}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default InfoField;