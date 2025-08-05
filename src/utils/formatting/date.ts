// src/utils/formatting/date.ts
// Get user's locale with fallback to German format - SSR safe
export const getUserLocale = (): string => {
  if (typeof window !== "undefined") {
    try {
      return navigator.language || navigator.languages?.[0] || "de-CH";
    } catch (error) {
      return "de-CH"; // Fallback on any error
    }
  }
  return "de-CH"; // Default to German-Swiss format (dd.mm.yyyy) for SSR
};

// Default format options for dd.mm.yyyy HH:mm (German style) - SSR safe
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

// SSR-safe formatting functions that use appropriate locale
const formatDate = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    // Use user locale on client side, German on server side for consistency
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    return date.toLocaleString(locale, getDefaultDateTimeFormat());
  } catch (e) {
    return fallbackText;
  }
};

const formatDateOnly = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    // Use user locale on client side, German on server side for consistency
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    return date.toLocaleDateString(locale, getDefaultDateFormat());
  } catch (e) {
    return fallbackText;
  }
};

const formatTimeOnly = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    // Use user locale on client side, German on server side for consistency
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    return date.toLocaleTimeString(locale, getDefaultTimeFormat());
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

    // Use user locale on client side, German on server side for consistency
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    const formattedStartDate = startDate.toLocaleString(
      locale,
      getDefaultDateTimeFormat()
    );

    if (!endDate) {
      return formattedStartDate;
    }

    if (isDatesEqual(startDate, endDate)) {
      const formattedEndTime = endDate.toLocaleTimeString(
        locale,
        getDefaultTimeFormat()
      );
      const formattedStartDateOnly = startDate.toLocaleDateString(
        locale,
        getDefaultDateFormat()
      );
      const formattedStartTimeOnly = startDate.toLocaleTimeString(
        locale,
        getDefaultTimeFormat()
      );

      return `${formattedStartDateOnly} ${formattedStartTimeOnly} - ${formattedEndTime}`;
    }

    const formattedEndDate = endDate.toLocaleString(
      locale,
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
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    return date.toDate().toLocaleString(locale, getDefaultDateTimeFormat());
  } catch (e) {
    return "";
  }
};

// Format dayjs object to dd.mm.yyyy
const formatDayjsDate = (date: any) => {
  if (!date) return "";
  try {
    const locale = typeof window !== "undefined" ? getUserLocale() : "de-CH";
    return date.toDate().toLocaleDateString(locale, getDefaultDateFormat());
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
  getDefaultDateTimeFormat,
  getDefaultDateFormat,
  getDefaultTimeFormat,
};
