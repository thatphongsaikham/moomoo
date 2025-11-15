import { useTranslation } from "react-i18next";

/**
 * Custom hook for bilingual language management
 * Provides current language state and toggle functionality
 * @returns {Object} { language, toggleLanguage, t }
 */
export const useBilingual = () => {
  const { i18n, t } = useTranslation();

  // Get current language (th or en)
  const language = i18n.language;

  /**
   * Toggle between Thai and English
   */
  const toggleLanguage = () => {
    const newLanguage = language === "th" ? "en" : "th";
    i18n.changeLanguage(newLanguage);
  };

  /**
   * Set specific language
   * @param {string} lang - Language code ('th' or 'en')
   */
  const setLanguage = (lang) => {
    if (lang === "th" || lang === "en") {
      i18n.changeLanguage(lang);
    }
  };

  return {
    language,
    toggleLanguage,
    setLanguage,
    t,
    isThai: language === "th",
    isEnglish: language === "en",
  };
};
