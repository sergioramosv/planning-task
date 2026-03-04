'use client';

import { useLanguage, Language } from '@/contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  return (
    <div className={styles.container}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.button} ${language === lang.code ? styles.active : ''}`}
          onClick={() => handleLanguageChange(lang.code as Language)}
          title={lang.name}
        >
          <span className={styles.flag}>{lang.flag}</span>
          <span className={styles.code}>{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
