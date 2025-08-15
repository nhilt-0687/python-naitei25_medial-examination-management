type MetricProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
};

export default function Metric({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: MetricProps) {
  return (
    <div>
      <div className="rounded-2xl border bg-white p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {title}
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {value}
            </h4>
          </div>
          <div
            className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl`}
          >
            <Icon className={`${iconColor} size-7`} />
          </div>
        </div>
      </div>
    </div>
  );
}
