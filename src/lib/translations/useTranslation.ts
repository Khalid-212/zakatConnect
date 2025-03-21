// Translation hook
import { useState, useCallback } from 'react';
import { translations, Language, TranslationKey } from '.';

export function useTranslation() {
  // Get language from localStorage or default to 'en'
  const getSavedLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en';
    const savedLanguage = localStorage.getItem('language') as Language | null;
    return savedLanguage ? (savedLanguage as Language) : 'en';
  };

  const [language, setLanguage] = useState<Language>(getSavedLanguage());

  // Function to change language
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  }, []);

  // Get current translations
  const t = translations[language];

  return {
    language,
    changeLanguage,
    t,
  };
}
