type MetricProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  time: string,
};

export default function Metric({title, value, icon: Icon, iconColor, bgColor, time}: MetricProps) {
  return (
    <div>
      <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl dark:bg-gray-800`}>
            <Icon className={`${iconColor} size-7 dark:text-white/90`} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-400 font-medium">Tổng bệnh nhân trong {time} là 
            <span className={`${iconColor} font-bold`}> {value}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
