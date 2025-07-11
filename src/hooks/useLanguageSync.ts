// src/hooks/useLanguageSync.ts
"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook to sync language with browser preferences after hydration
 * This prevents hydration mismatches while still respecting user preferences
 */
export function useLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run on client after hydration
    if (typeof window === "undefined") return;

    // Get user's preferred language from cookies or browser
    const getPreferredLanguage = () => {
      // Check cookie first
      const cookieLang = document.cookie
        .split("; ")
        .find((row) => row.startsWith("lang="))
        ?.split("=")[1];

      if (cookieLang && ["en", "de"].includes(cookieLang)) {
        return cookieLang;
      }

      // Check browser language
      const browserLang = navigator.language.split("-")[0];
      if (["en", "de"].includes(browserLang)) {
        return browserLang;
      }

      return "en"; // fallback
    };

    const preferredLang = getPreferredLanguage();

    // Only change if different from current language
    if (i18n.language !== preferredLang) {
      i18n.changeLanguage(preferredLang);

      // Update cookie
      document.cookie = `lang=${preferredLang}; path=/; max-age=31536000`; // 1 year
      document.cookie = `i18next=${preferredLang}; path=/; max-age=31536000`; // 1 year
    }
  }, [i18n]);
}
