// src/utils/formatting/formatDate.tsx
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

export { formatDate };
