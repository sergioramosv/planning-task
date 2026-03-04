'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase/config';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'planning-task-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('es');
  const [initialized, setInitialized] = useState(false);

  // Load language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      // 1. Try to load from user profile (Firebase)
      if (user?.language) {
        await i18n.changeLanguage(user.language);
        setLanguageState(user.language as Language);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, user.language);
      }
      // 2. Try to load from localStorage
      else {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
          await i18n.changeLanguage(savedLanguage);
          setLanguageState(savedLanguage);
        }
      }
      setInitialized(true);
    };

    loadLanguage();
  }, [user, i18n]);

  const setLanguage = async (lang: Language) => {
    try {
      // 1. Update i18next
      await i18n.changeLanguage(lang);

      // 2. Update local state
      setLanguageState(lang);

      // 3. Save to localStorage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // 4. Save to user profile in Firebase (if logged in)
      if (user?.uid) {
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, { language: lang });
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
