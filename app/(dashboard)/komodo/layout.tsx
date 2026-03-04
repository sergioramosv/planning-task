'use client';

import { KomodoNotificationProvider } from '@/components/komodo/KomodoNotificationProvider';
import { KomodoNav } from '@/components/komodo/KomodoNav';
import styles from './layout.module.css';

export default function KomodoLayout({ children }: { children: React.ReactNode }) {
  return (
    <KomodoNotificationProvider>
      <div className={styles.wrapper}>
        <KomodoNav />
        {children}
      </div>
    </KomodoNotificationProvider>
  );
}
