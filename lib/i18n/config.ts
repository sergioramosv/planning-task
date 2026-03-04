import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

// Only initialize if not already initialized (prevents double initialization)
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'es', // Default language
      fallbackLng: 'es',
      debug: false,
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false, // Important for Next.js App Router
      },
    });
}

export default i18n;
