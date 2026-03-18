'use client'

import { useState } from 'react'
import { LinkedPR } from '@/types/task'
import { GitPullRequest, ExternalLink, Trash2, Plus, GitMerge, XCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './GitHubLink.module.css'

interface GitHubLinkProps {
  linkedPRs: LinkedPR[]
  onAddPR: (pr: Omit<LinkedPR, 'id'>) => void
  onRemovePR: (prId: string) => void
  onUpdatePRStatus: (prId: string, status: LinkedPR['status']) => void
  userId: string
}

function parsePRUrl(input: string): { repo: string; number: number; url: string } | null {
  // Support full URL: https://github.com/owner/repo/pull/123
  const urlMatch = input.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/)
  if (urlMatch) {
    return {
      repo: urlMatch[1],
      number: parseInt(urlMatch[2]),
      url: `https://github.com/${urlMatch[1]}/pull/${urlMatch[2]}`,
    }
  }
  // Support short format: owner/repo#123
  const shortMatch = input.match(/^([^/]+\/[^#]+)#(\d+)$/)
  if (shortMatch) {
    return {
      repo: shortMatch[1],
      number: parseInt(shortMatch[2]),
      url: `https://github.com/${shortMatch[1]}/pull/${shortMatch[2]}`,
    }
  }
  return null
}

function getStatusIcon(status: LinkedPR['status']) {
  switch (status) {
    case 'open':
      return <GitPullRequest size={14} className={styles.statusOpen} />
    case 'merged':
      return <GitMerge size={14} className={styles.statusMerged} />
    case 'closed':
      return <XCircle size={14} className={styles.statusClosed} />
  }
}

function getStatusLabel(status: LinkedPR['status']) {
  switch (status) {
    case 'open': return 'Open'
    case 'merged': return 'Merged'
    case 'closed': return 'Closed'
  }
}

export default function GitHubLink({
  linkedPRs,
  onAddPR,
  onRemovePR,
  onUpdatePRStatus,
  userId,
}: GitHubLinkProps) {
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('')
  const [branch, setBranch] = useState('')
  const [error, setError] = useState('')

  const handleAdd = () => {
    setError('')
    const parsed = parsePRUrl(input.trim())
    if (!parsed) {
      setError(t('github.invalidFormat'))
      return
    }
    // Check for duplicates
    if (linkedPRs.some(pr => pr.repo === parsed.repo && pr.number === parsed.number)) {
      setError(t('github.alreadyLinked'))
      return
    }
    onAddPR({
      number: parsed.number,
      repo: parsed.repo,
      url: parsed.url,
      title: title.trim() || `PR #${parsed.number}`,
      status: 'open',
      branch: branch.trim() || undefined,
      linkedAt: Date.now(),
      linkedBy: userId,
    })
    setInput('')
    setTitle('')
    setBranch('')
    setShowForm(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GitPullRequest size={16} className={styles.icon} />
        <span className={styles.headerTitle}>{t('github.title')}</span>
        <span className={styles.count}>{linkedPRs.length}</span>
      </div>

      {linkedPRs.length > 0 && (
        <div className={styles.prList}>
          {linkedPRs.map(pr => (
            <div key={pr.id} className={styles.prItem}>
              <div className={styles.prInfo}>
                {getStatusIcon(pr.status)}
                <a href={pr.url} target="_blank" rel="noopener noreferrer" className={styles.prLink}>
                  <span className={styles.prRepo}>{pr.repo}</span>
                  <span className={styles.prNumber}>#{pr.number}</span>
                </a>
                {pr.title && <span className={styles.prTitle}>{pr.title}</span>}
                {pr.branch && <span className={styles.prBranch}>{pr.branch}</span>}
              </div>
              <div className={styles.prActions}>
                <select
                  className={styles.statusSelect}
                  value={pr.status}
                  onChange={e => onUpdatePRStatus(pr.id, e.target.value as LinkedPR['status'])}
                >
                  <option value="open">Open</option>
                  <option value="merged">Merged</option>
                  <option value="closed">Closed</option>
                </select>
                <a href={pr.url} target="_blank" rel="noopener noreferrer" className={styles.externalLink} title={t('github.openInGitHub')}>
                  <ExternalLink size={12} />
                </a>
                <button className={styles.removeBtn} onClick={() => onRemovePR(pr.id)} title={t('common.delete')}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          <Plus size={14} />
          {t('github.linkPR')}
        </button>
      ) : (
        <div className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder={t('github.prPlaceholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <input
            type="text"
            className={styles.input}
            placeholder={t('github.titlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder={t('github.branchPlaceholder')}
            value={branch}
            onChange={e => setBranch(e.target.value)}
          />
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setError('') }}>
              {t('common.cancel')}
            </button>
            <button className={styles.confirmBtn} onClick={handleAdd} disabled={!input.trim()}>
              {t('github.link')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
