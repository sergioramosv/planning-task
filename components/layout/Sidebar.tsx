'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderOpen, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => {
    return pathname?.includes(path)
  }

  const handleLogout = async () => {
    await logout()
  }

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Proyectos',
      href: '/projects',
      icon: FolderOpen,
    },
  ]

  return (
    <aside
      className={cn(
        styles.sidebar,
        isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      )}
    >
      <div className={styles.logoSection}>
        {!isCollapsed && <h1 className={styles.logoText}>Planning Task</h1>}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <li key={item.href} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={cn(
                    styles.navLink,
                    isActive(item.href) && styles.navLinkActive
                  )}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span className={styles.navLinkText}>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={styles.logoutSection}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className={styles.logoutText}>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
