// src/hooks/useLanguageSync.ts
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook to sync language with browser preferences after hydration
 * This prevents hydration mismatches while still respecting user preferences
 */

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side

    const syncLanguage = () => {
      const savedLanguage = localStorage.getItem("language");
      const browserLanguage = navigator.language?.split("-")[0] || "en";
      const targetLanguage = savedLanguage || browserLanguage;

      if (i18n.language !== targetLanguage) {
        i18n.changeLanguage(targetLanguage);
      }
    };

    syncLanguage();
  }, [i18n, isClient]);
};
