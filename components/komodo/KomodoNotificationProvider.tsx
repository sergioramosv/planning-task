'use client';

import { KomodoNotificationsContext, useKomodoNotificationsProvider } from '@/hooks/komodo/useKomodoNotifications';
import { ToastContainer } from '@/components/komodo/ToastNotifications';

export function KomodoNotificationProvider({ children }: { children: React.ReactNode }) {
  const state = useKomodoNotificationsProvider();

  return (
    <KomodoNotificationsContext.Provider value={state}>
      {children}
      <ToastContainer />
    </KomodoNotificationsContext.Provider>
  );
}
