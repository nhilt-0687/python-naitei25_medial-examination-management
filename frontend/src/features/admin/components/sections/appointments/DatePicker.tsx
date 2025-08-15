import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "../../form/Label";
import { CalendarIcon } from "../../assets/icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: React.ReactNode;
  placeholder?: string;
  value?: string;
  error?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  value,
  error,
}: PropsType) {
  const pickerRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat: "Y-m-d", // Changed to match the format you use in state
      defaultDate: value || defaultDate,
      onChange,
    });

    pickerRef.current = Array.isArray(flatPickr) ? flatPickr[0] : flatPickr;

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, value]);

  // Update instance when value changes externally
  useEffect(() => {
    if (pickerRef.current && value) {
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
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 ${
            error ? "border-red-500" : "border-gray-300"
          } focus:border-base-300 focus:ring-base-500/20 dark:border-gray-700 dark:focus:border-base-800`}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalendarIcon className="size-6" />
        </span>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
