// src/utils/formatting/date.ts
// Get user's locale with fallback to German format
const getUserLocale = (): string => {
  if (typeof window !== "undefined") {
    return navigator.language || navigator.languages?.[0] || "de-DE";
  }
  return "de-DE"; // Default to German format (dd.mm.yyyy)
};

// Default format options for dd.mm.yyyy HH:mm
const getDefaultDateTimeFormat = () => ({
  day: "2-digit" as const,
  month: "2-digit" as const,
  year: "numeric" as const,
  hour: "2-digit" as const,
  minute: "2-digit" as const,
  hour12: false, // Use 24-hour format
});

const getDefaultDateFormat = () => ({
  day: "2-digit" as const,
  month: "2-digit" as const,
  year: "numeric" as const,
});

const getDefaultTimeFormat = () => ({
  hour: "2-digit" as const,
  minute: "2-digit" as const,
  hour12: false, // Use 24-hour format
});

const formatDate = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString(getUserLocale(), getDefaultDateTimeFormat());
  } catch (e) {
    return fallbackText;
  }
};

const formatDateOnly = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString(getUserLocale(), getDefaultDateFormat());
  } catch (e) {
    return fallbackText;
  }
};

const formatTimeOnly = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString(getUserLocale(), getDefaultTimeFormat());
  } catch (e) {
    return fallbackText;
  }
};

const isDatesEqual = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDateRange = (
  startTime: string,
  endTime?: string | null,
  fallbackText?: string | null
) => {
  try {
    const startDate = new Date(parseInt(startTime) * 1000);
    const endDate = endTime ? new Date(parseInt(endTime) * 1000) : null;

    const formattedStartDate = startDate.toLocaleString(
      getUserLocale(),
      getDefaultDateTimeFormat()
    );

    if (!endDate) {
      return formattedStartDate;
    }

    if (isDatesEqual(startDate, endDate)) {
      const formattedEndTime = endDate.toLocaleTimeString(
        getUserLocale(),
        getDefaultTimeFormat()
      );
      const formattedStartDateOnly = startDate.toLocaleDateString(
        getUserLocale(),
        getDefaultDateFormat()
      );
      const formattedStartTimeOnly = startDate.toLocaleTimeString(
        getUserLocale(),
        getDefaultTimeFormat()
      );

      return `${formattedStartDateOnly} ${formattedStartTimeOnly} - ${formattedEndTime}`;
    }

    const formattedEndDate = endDate.toLocaleString(
      getUserLocale(),
      getDefaultDateTimeFormat()
    );

    return `${formattedStartDate} - ${formattedEndDate}`;
  } catch (e) {
    return fallbackText;
  }
};

// Format dayjs object to dd.mm.yyyy HH:mm
const formatDayjsDateTime = (date: any) => {
  if (!date) return "";
  try {
    return date
      .toDate()
      .toLocaleString(getUserLocale(), getDefaultDateTimeFormat());
  } catch (e) {
    return "";
  }
};

// Format dayjs object to dd.mm.yyyy
const formatDayjsDate = (date: any) => {
  if (!date) return "";
  try {
    return date
      .toDate()
      .toLocaleDateString(getUserLocale(), getDefaultDateFormat());
  } catch (e) {
    return "";
  }
};

export {
  formatDate,
  formatDateRange,
  formatDateOnly,
  formatTimeOnly,
  formatDayjsDateTime,
  formatDayjsDate,
  getUserLocale,
  getDefaultDateTimeFormat,
  getDefaultDateFormat,
  getDefaultTimeFormat,
};
