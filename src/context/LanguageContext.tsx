'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Language, getTranslation, getCategoryTranslation } from '@/locales';
import { Category } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  tCategory: (cat: Category) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'meditation_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language preference from localStorage or browser language on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'es') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
        return;
      }

      // Check browser locale
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
        setLanguageState(browserLang);
        document.documentElement.lang = browserLang;
      }
    } catch {
      // Storage unavailable or server-side render
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage write error
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return getTranslation(language, path, params);
    },
    [language]
  );

  const tCategory = useCallback(
    (cat: Category) => {
      return getCategoryTranslation(language, cat);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
