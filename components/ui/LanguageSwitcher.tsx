'use client';

import { useLanguage, Language } from '@/contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={styles.container}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.button} ${language === lang.code ? styles.active : ''}`}
          onClick={() => setLanguage(lang.code as Language)}
          title={lang.name}
        >
          <span className={styles.flag}>{lang.flag}</span>
          <span className={styles.code}>{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
