// src/hooks/useClientLocale.ts
import { useState, useEffect } from "react";
import { getDayjsLocale } from "@/utils/formatting/dayjsConfig";
import {
  getDatePickerFormat,
  getDateTimePickerFormat,
} from "@/utils/formatting/datePickerConfig";
import dayjs from "dayjs";

export interface LocaleInfo {
  locale: string;
  dateFormat: string;
  dateTimeFormat: string;
  isClient: boolean;
}

/**
 * Hook to safely manage client-side locale detection
 * Prevents hydration mismatches while respecting user browser settings
 */
export const useClientLocale = (): LocaleInfo => {
  const [isClient, setIsClient] = useState(false);
  const [locale, setLocale] = useState("de");
  const [dateFormat, setDateFormat] = useState("DD.MM.YYYY");
  const [dateTimeFormat, setDateTimeFormat] = useState("DD.MM.YYYY HH:mm");

  useEffect(() => {
    setIsClient(true);

    // Get user's actual locale on client side
    const userLocale = getDayjsLocale();
    setLocale(userLocale);

    // Configure dayjs with user's locale
    dayjs.locale(userLocale);

    // Set appropriate formats based on locale
    setDateFormat(getDatePickerFormat());
    setDateTimeFormat(getDateTimePickerFormat());

    console.log("Client locale configured:", {
      userLocale,
      dateFormat: getDatePickerFormat(),
      dateTimeFormat: getDateTimePickerFormat(),
    });
  }, []);

  return {
    locale,
    dateFormat,
    dateTimeFormat,
    isClient,
  };
};
