// src/utils/formatting/dayjsConfig.ts
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/de";
import "dayjs/locale/en";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

// Get dayjs locale code from user locale with SSR-safe fallback
export const getDayjsLocale = (): string => {
  // Server-side: always default to German to prevent hydration mismatches
  if (typeof window === "undefined") {
    return "de";
  }

  // Client-side: detect user locale properly
  try {
    const userLocale =
      navigator.language || navigator.languages?.[0] || "de-CH";
    if (userLocale.startsWith("en")) return "en";
    if (userLocale.startsWith("de")) return "de";
    // Add more locales as needed
    if (userLocale.startsWith("fr")) return "de"; // Fallback to German for unsupported locales
    if (userLocale.startsWith("it")) return "de"; // Fallback to German for unsupported locales
    return "de"; // Default fallback
  } catch (error) {
    return "de"; // Fallback on any error
  }
};

// Configure dayjs with consistent locale
export const configureDayjs = () => {
  const locale = getDayjsLocale();
  dayjs.locale(locale);
  return locale;
};

// Reconfigure dayjs with user locale on client side
export const reconfigureClientDayjs = () => {
  if (typeof window !== "undefined") {
    const locale = getDayjsLocale();
    dayjs.locale(locale);
    console.log("Dayjs reconfigured for client with locale:", locale);
    return locale;
  }
  return "de"; // Server fallback
};

// Set up dayjs on import with consistent behavior
configureDayjs();

// Export the dayjs instance as default and also export the type
export default dayjs;
export { dayjs };
export type { Dayjs };
