'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { User } from 'lucide-react'
import styles from './Navbar.module.css'

interface NavbarProps {
  title?: string
}

export default function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <nav className={styles.navbar}>
      <h2 className={styles.title}>{title}</h2>
      <button
        onClick={() => router.push('/profile')}
        className={styles.userSection}
      >
        <User size={18} className={styles.userIcon} />
        <span className={styles.userInfo}>{user?.displayName || 'Usuario'}</span>
      </button>
    </nav>
  )
}
