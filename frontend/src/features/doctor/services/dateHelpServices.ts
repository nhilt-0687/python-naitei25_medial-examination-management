import dayjs from 'dayjs';

// Convert string from database to dayjs object for Ant Design DatePicker
export const stringToDate = (dateString: string | null | undefined): dayjs.Dayjs | null => {
  if (!dateString) return null;
  const date = dayjs(dateString);
  return date.isValid() ? date : null;
};

// Convert dayjs object from Ant Design DatePicker to string for database
export const dateToString = (date: dayjs.Dayjs | null): string | null => {
  if (!date) return null;
  return date.isValid() ? date.format('YYYY-MM-DD') : null;
};
