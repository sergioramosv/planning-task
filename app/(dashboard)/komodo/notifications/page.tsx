'use client';

import { useState } from 'react';
import { useKomodoNotifications } from '@/hooks/komodo/useKomodoNotifications';
import type { NotificationType } from '@/lib/komodo/types';
import styles from './page.module.css';

const TYPE_FILTERS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const TYPE_ICON: Record<NotificationType, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '▲',
  error: '✕',
};

const TYPE_STYLE_MAP: Record<NotificationType, string> = {
  success: 'iconSuccess',
  info: 'iconInfo',
  warning: 'iconWarning',
  error: 'iconError',
};

export default function KomodoNotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useKomodoNotifications();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className={styles.actionBtn}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className={styles.actionBtn}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {notifications.length === 0
              ? 'No notifications yet'
              : 'No notifications match this filter'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((notif) => {
            const iconStyleKey = TYPE_STYLE_MAP[notif.type];
            const time = new Date(notif.timestamp).toLocaleTimeString();
            const date = new Date(notif.timestamp).toLocaleDateString();

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && markRead(notif.id)}
                className={`${styles.notifCard} ${notif.read ? styles.notifRead : styles.notifUnread}`}
              >
                <span className={`${styles.iconCircle} ${styles[iconStyleKey]}`}>
                  {TYPE_ICON[notif.type]}
                </span>
                <div className={styles.notifContent}>
                  <div className={styles.notifTitleRow}>
                    <p className={`${styles.notifTitle} ${notif.read ? styles.notifTitleRead : styles.notifTitleUnread}`}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className={styles.unreadDot} />}
                  </div>
                  <p className={`${styles.notifMessage} ${notif.read ? styles.notifMessageRead : styles.notifMessageUnread}`}>
                    {notif.message}
                  </p>
                  <p className={styles.notifTime}>{date} {time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
