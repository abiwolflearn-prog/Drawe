import React, { createContext, useContext, useState } from 'react';
import { am } from './locales/am.js';
import { en } from './locales/en.js';

export type Language = 'am' | 'en';

type Dictionaries = typeof am;

const dictionaries: Record<Language, Dictionaries> = {
  am,
  en,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Amharic 'am' is default
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return saved === 'en' ? 'en' : 'am';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  /**
   * Helper to retrieve nested keys like t('draw.availableNumbers')
   */
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let current: any = dictionaries[language] || dictionaries.am;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary if key missing
        let fallback: any = dictionaries.en;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return keyPath; // Return key path if missing
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') return keyPath;

    let result = current;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }

    return result;
  };

  /**
   * Format currency (ETB / ብር)
   */
  const formatCurrency = (amount: number): string => {
    const formatted = amount.toLocaleString();
    if (language === 'am') {
      return `${formatted} ብር`;
    }
    return `${formatted} ETB`;
  };

  /**
   * Format dates cleanly
   */
  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, formatCurrency, formatDate }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
};
