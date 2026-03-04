'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase/config';
import i18n from '@/lib/i18n/config';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'planning-task-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      return saved && (saved === 'en' || saved === 'es') ? saved : 'es';
    }
    return 'es';
  });

  // Sync with i18n on mount
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []);

  // Load language preference from user profile
  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguage(user.language as Language);
    }
  }, [user?.language]);

  const setLanguage = (lang: Language) => {
    // 1. Update i18next immediately
    i18n.changeLanguage(lang);

    // 2. Update local state
    setLanguageState(lang);

    // 3. Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    // 4. Save to user profile in Firebase (if logged in)
    if (user?.uid) {
      const userRef = ref(database, `users/${user.uid}`);
      update(userRef, { language: lang }).catch((error) => {
        console.error('Error saving language to Firebase:', error);
      });
    }
  };

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
