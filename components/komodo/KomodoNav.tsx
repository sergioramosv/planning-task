'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKomodoNotifications } from '@/hooks/komodo/useKomodoNotifications';
import styles from './KomodoNav.module.css';

const NAV_ITEMS = [
  { href: '/komodo', label: 'Dashboard', icon: '▣', exact: true },
  { href: '/komodo/agents', label: 'Agents', icon: '⚙', exact: false },
  { href: '/komodo/notifications', label: 'Notifications', icon: '▢', exact: false },
  { href: '/komodo/memory', label: 'Memory', icon: '◉', exact: false },
  { href: '/komodo/settings', label: 'Settings', icon: '☰', exact: false },
];

export function KomodoNav() {
  const pathname = usePathname();
  const { unreadCount } = useKomodoNotifications();

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        const showBadge = item.href === '/komodo/notifications' && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.link} ${active ? styles.linkActive : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
            {showBadge && (
              <span className={styles.badge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
