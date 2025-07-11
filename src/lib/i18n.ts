// src/lib/i18n.ts
"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

// Initialize with server language for consistent SSR/Client rendering
export function initI18n(serverLang: string) {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .use(
        resourcesToBackend(
          (language: string) =>
            import(`/public/locales/${language}/translation.json`)
        )
      )
      .init({
        lng: serverLang, // Always use server language for consistency
        fallbackLng: "en",
        supportedLngs: ["en", "de"],
        debug: process.env.NODE_ENV === "development",
        ns: ["translation"],
        defaultNS: "translation",
        interpolation: {
          escapeValue: false,
        },
        // Disable client-side detection to prevent hydration mismatches
        detection: {
          order: [],
          caches: [],
        },
      });
  }

  return i18n;
}

// Export a pre-configured instance for imports
export default i18n;
