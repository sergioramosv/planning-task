'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TimerProvider } from '@/contexts/TimerContext';
import '@/lib/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n config on mount
  }, []);

  return (
    <LanguageProvider>
      <TimerProvider>
        {children}
      </TimerProvider>
    </LanguageProvider>
  );
}
