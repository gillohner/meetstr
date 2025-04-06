// src/lib/i18n.ts
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize with server language, but don't change language yet
export function initI18n(serverLang: string) {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .use(LanguageDetector)
      .use(resourcesToBackend((language: string) => 
        import(`/public/locales/${language}/translation.json`)
      ))
      .init({
        lng: serverLang, // Initialize with server language
        fallbackLng: 'en',
        supportedLngs: ['en', 'de'],
        debug: process.env.NODE_ENV === 'development',
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['cookie', 'localStorage', 'navigator'],
          caches: ['cookie', 'localStorage'],
        },
      });
  } else if (i18n.language !== serverLang) {
    // Only change language after initialization if needed
    i18n.changeLanguage(serverLang);
  }
  
  return i18n;
}

// Export a pre-configured instance for imports
export default i18n;
