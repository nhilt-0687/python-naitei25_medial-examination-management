import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "../../form/Label";
import { TimeIcon } from "../../assets/icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
};

export default function TimePicker({
  id,
  onChange,
  defaultDate,
  label,
  placeholder,
  value,
  error
}: PropsType) {

  const pickerRef = useRef<flatpickr.Instance | null>(null);
    useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      defaultDate: value || defaultDate,
      onChange,
    });

    pickerRef.current = Array.isArray(flatPickr) ? flatPickr[0] : flatPickr;

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [id, onChange, defaultDate, value]);

  // Cập nhật mỗi khi giá trị thay đổi
  useEffect(() => {
    if(pickerRef.current && value) {
        pickerRef.current.setDate(value, false);
    }
  }, [value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs appearance-none bg-transparent text-gray-800 ${error ? 'border-red-500' : 'border-gray-300'} border-gray-300 placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-base-300 focus:ring-base-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-base-800`}
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
          <TimeIcon className="size-6" />
        </span>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
