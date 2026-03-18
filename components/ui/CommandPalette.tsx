'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useLanguage } from '@/contexts/LanguageContext'
import { Search, FolderOpen, CheckSquare, Bug, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { TaskService } from '@/lib/services/task.service'
import { BugService } from '@/lib/services/bug.service'
import { Task } from '@/types'
import styles from './CommandPalette.module.css'

interface Bug {
  id: string
  title: string
  projectId: string
  severity?: string
  status?: string
}

interface SearchResult {
  id: string
  type: 'project' | 'task' | 'bug'
  title: string
  meta: string
  status?: string
  url: string
}

export default function CommandPalette() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [allBugs, setAllBugs] = useState<Bug[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setActiveIndex(0)
    }
  }, [isOpen])

  // Load tasks and bugs from all user projects
  useEffect(() => {
    if (!isOpen || dataLoaded || projects.length === 0) return

    const loadData = async () => {
      try {
        const projectIds = projects.map(p => p.id)
        const [tasksArrays, bugsArrays] = await Promise.all([
          Promise.all(projectIds.map(id => TaskService.getTasksByProject(id))),
          Promise.all(projectIds.map(id => BugService.getBugsByProject(id))),
        ])
        setAllTasks(tasksArrays.flat())
        setAllBugs(bugsArrays.flat())
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading search data:', error)
      }
    }
    loadData()
  }, [isOpen, dataLoaded, projects])

  // Reset data cache when palette closes
  useEffect(() => {
    if (!isOpen) setDataLoaded(false)
  }, [isOpen])

  // Search logic
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    const matched: SearchResult[] = []

    // Search projects
    projects
      .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(p => {
        matched.push({
          id: p.id,
          type: 'project',
          title: p.name,
          meta: p.status || '',
          status: p.status,
          url: `/projects/${p.id}`,
        })
      })

    // Search tasks
    allTasks
      .filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(t => {
        const projectName = projects.find(p => p.id === t.projectId)?.name || ''
        matched.push({
          id: t.id,
          type: 'task',
          title: t.title,
          meta: projectName,
          status: t.status,
          url: `/projects/${t.projectId}`,
        })
      })

    // Search bugs
    allBugs
      .filter(b => b.title.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(b => {
        const projectName = projects.find(p => p.id === b.projectId)?.name || ''
        matched.push({
          id: b.id,
          type: 'bug',
          title: b.title,
          meta: projectName,
          status: b.severity,
          url: `/projects/${b.projectId}`,
        })
      })

    return matched
  }, [query, projects, allTasks, allBugs])

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach(r => {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    })
    return groups
  }, [results])

  const flatResults = results

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && flatResults[activeIndex]) {
      e.preventDefault()
      router.push(flatResults[activeIndex].url)
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [flatResults, activeIndex, router])

  // Scroll active item into view
  useEffect(() => {
    if (!resultsRef.current) return
    const activeItem = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`)
    activeItem?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleSelect = (url: string) => {
    router.push(url)
    setIsOpen(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return t('projects.title')
      case 'task': return t('tasks.title')
      case 'bug': return t('bugs.title')
      default: return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen size={16} />
      case 'task': return <CheckSquare size={16} />
      case 'bug': return <Bug size={16} />
      default: return <Search size={16} />
    }
  }

  const getIconClass = (type: string) => {
    switch (type) {
      case 'project': return styles.itemIconProject
      case 'task': return styles.itemIconTask
      case 'bug': return styles.itemIconBug
      default: return ''
    }
  }

  if (!isOpen) return null

  let globalIndex = 0

  return (
    <>
      <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      <div className={styles.container}>
        <div className={styles.palette} onKeyDown={handleKeyDown}>
          <div className={styles.inputWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder={t('commandPalette.placeholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className={styles.shortcut}>
              <kbd className={styles.kbd}>ESC</kbd>
            </div>
          </div>

          <div className={styles.results} ref={resultsRef}>
            {query.trim() === '' ? (
              <div className={styles.empty}>
                <Search size={32} />
                <span className={styles.emptyText}>{t('commandPalette.hint')}</span>
              </div>
            ) : flatResults.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyText}>{t('commandPalette.noResults')}</span>
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className={styles.group}>
                  <div className={styles.groupLabel}>{getTypeLabel(type)}</div>
                  {items.map(item => {
                    const idx = globalIndex++
                    return (
                      <div
                        key={item.id}
                        data-index={idx}
                        className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                        onClick={() => handleSelect(item.url)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className={`${styles.itemIcon} ${getIconClass(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemTitle}>{item.title}</div>
                          {item.meta && <div className={styles.itemMeta}>{item.meta}</div>}
                        </div>
                        {item.status && (
                          <span className={styles.itemBadge}>{item.status}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerItem}>
              <ArrowUp size={12} /><ArrowDown size={12} /> {t('commandPalette.navigate')}
            </div>
            <div className={styles.footerItem}>
              <CornerDownLeft size={12} /> {t('commandPalette.open')}
            </div>
            <div className={styles.footerItem}>
              <kbd className={styles.kbd}>ESC</kbd> {t('commandPalette.close')}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
