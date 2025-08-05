// src/utils/formatting/datePickerConfig.ts
// Dynamic date format for date pickers based on user locale
import dayjs, { getDayjsLocale } from "./dayjsConfig";

// Get format based on user locale - respects browser settings on client
export const getDatePickerFormat = () => {
  const locale = getDayjsLocale();
  // Return appropriate format for user's locale
  if (locale === "en") return "MM/DD/YYYY";
  return "DD.MM.YYYY"; // German and other locales
};

export const getDateTimePickerFormat = () => {
  const locale = getDayjsLocale();
  // Return appropriate format for user's locale
  if (locale === "en") return "MM/DD/YYYY HH:mm";
  return "DD.MM.YYYY HH:mm"; // German and other locales
};

// Test function to verify dayjs locale is properly configured
export const testDateLocale = () => {
  const testDate = dayjs("2024-03-15 14:30");
  console.log("Dayjs locale:", dayjs.locale());
  console.log("Formatted date:", testDate.format(getDateTimePickerFormat()));
  console.log("Localized date:", testDate.format("L LT"));
  return testDate.format(getDateTimePickerFormat());
};

// Configure dayjs with user's locale (will be called on client)
export const configureUserLocale = () => {
  const locale = getDayjsLocale();
  dayjs.locale(locale);
  return locale;
};

export default {
  getDatePickerFormat,
  getDateTimePickerFormat,
  testDateLocale,
  configureUserLocale,
};
