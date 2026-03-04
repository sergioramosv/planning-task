'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', code: 'EN' },
  es: { name: 'Español', flag: '🇪🇸', code: 'ES' },
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const currentLang = LANGUAGES[language];
  const nextLanguage = language === 'en' ? 'es' : 'en';
  const nextLang = LANGUAGES[nextLanguage];

  const handleToggle = () => {
    setLanguage(nextLanguage);
  };

  return (
    <button
      onClick={handleToggle}
      className={styles.button}
      title={`${currentLang.name} → ${nextLang.name}`}
      aria-label={`Switch to ${nextLang.name}`}
    >
      <span className={styles.flag}>{currentLang.flag}</span>
      <span className={styles.code}>{currentLang.code}</span>
    </button>
  );
}
