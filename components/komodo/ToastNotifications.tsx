'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useKomodoNotifications } from '@/hooks/komodo/useKomodoNotifications';
import type { KomodoNotification, NotificationType } from '@/lib/komodo/types';
import styles from './ToastNotifications.module.css';

const TOAST_DURATION = 5000;
const MAX_VISIBLE = 5;

const TYPE_CONFIG: Record<NotificationType, { borderClass: string; icon: string; iconClass: string }> = {
  success: { borderClass: styles.borderSuccess, icon: '\u2713', iconClass: styles.iconSuccess },
  warning: { borderClass: styles.borderWarning, icon: '\u25B2', iconClass: styles.iconWarning },
  error:   { borderClass: styles.borderError,   icon: '\u2715', iconClass: styles.iconError },
  info:    { borderClass: styles.borderInfo,     icon: '\u2139', iconClass: styles.iconInfo },
};

interface ToastItem {
  notification: KomodoNotification;
  leaving: boolean;
}

export function ToastContainer() {
  const { notifications } = useKomodoNotifications();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenRef = useRef(new Set<string>());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.notification.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.notification.id !== id));
    }, 300);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (seenRef.current.has(latest.id)) return;
    seenRef.current.add(latest.id);

    setToasts((prev) => {
      const next = [{ notification: latest, leaving: false }, ...prev];
      if (next.length > MAX_VISIBLE) {
        const excess = next.slice(MAX_VISIBLE);
        excess.forEach((t) => dismiss(t.notification.id));
      }
      return next.slice(0, MAX_VISIBLE);
    });

    const timer = setTimeout(() => dismiss(latest.id), TOAST_DURATION);
    timersRef.current.set(latest.id, timer);
  }, [notifications, dismiss]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => {
        const cfg = TYPE_CONFIG[toast.notification.type];
        return (
          <div
            key={toast.notification.id}
            className={`${styles.toast} ${cfg.borderClass} ${toast.leaving ? styles.toastLeaving : ''}`}
          >
            <span className={`${styles.icon} ${cfg.iconClass}`}>{cfg.icon}</span>
            <div className={styles.body}>
              <p className={styles.title}>{toast.notification.title}</p>
              <p className={styles.message}>{toast.notification.message}</p>
            </div>
            <button
              onClick={() => dismiss(toast.notification.id)}
              className={styles.dismissBtn}
            >
              &#10005;
            </button>
          </div>
        );
      })}
    </div>
  );
}
