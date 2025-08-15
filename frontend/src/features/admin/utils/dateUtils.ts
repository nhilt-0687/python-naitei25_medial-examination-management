export const formatTimeToVietnamese = (time: string): string => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

export const formatDateToVietnamese = (date: string): string => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export const formatDateTimeToVietnamese = (dateTime: string): string => {
  if (!dateTime) return "";
  const [date, time] = dateTime.split("T");
  return `${formatDateToVietnamese(date)} ${formatTimeToVietnamese(time)}`;
}; 