// src/utils/formatting/date.ts
// TODO: Add locales
const formatDate = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return fallbackText;
  }
};

const isDatesEqual = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDateRange = (startTime: string, endTime?: string, fallbackText: string) => {
  try {
    const startDate = new Date(parseInt(startTime) * 1000);
    const endDate = endTime ? new Date(parseInt(endTime) * 1000) : null;

    const formattedStartDate = startDate.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!endDate) {
      return formattedStartDate;
    }

    if (isDatesEqual(startDate, endDate)) {
      const formattedEndTime = endDate.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      return formattedStartDate + " - " + formattedEndTime;
    }

    const formattedEndDate = endDate.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2",
    });

    return formattedStartDate + " - " + formattedEndDate;
  } catch (e) {
    return fallbackText;
  }
};

export { formatDate, formatDateRange };
