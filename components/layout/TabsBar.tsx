'use client'

import styles from './TabsBar.module.css'

interface Tab {
  id: string
  label: string
  badge?: number
}

interface TabsBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TabsBar({ tabs, activeTab, onTabChange }: TabsBarProps) {
  return (
    <div className={styles.tabsBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.badge !== undefined && <span className={styles.badge}>{tab.badge}</span>}
        </button>
      ))}
    </div>
  )
}
