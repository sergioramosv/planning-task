'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@/lib/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n config on mount
  }, []);

  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
