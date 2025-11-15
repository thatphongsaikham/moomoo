import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import translationEN from "./locales/en.json";
import translationTH from "./locales/th.json";

// Translation resources
const resources = {
  en: translationEN,
  th: translationTH,
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "th", // Default language is Thai
    debug: false,

    // Language detection options
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace configuration
    defaultNS: "translation",
    ns: ["translation"],

    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

export default i18n;
