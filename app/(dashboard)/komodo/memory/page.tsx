'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Pattern, PatternType, Severity, MemoryStore } from '@/lib/komodo/memory-types';
import styles from './page.module.css';

const TYPE_LABELS: Record<PatternType, string> = {
  error: 'Error',
  'anti-pattern': 'Anti-pattern',
  style: 'Style',
  positive: 'Positive',
};

const TYPE_BADGE: Record<PatternType, string> = {
  error: 'badgeError',
  'anti-pattern': 'badgeAntiPattern',
  style: 'badgeStyle',
  positive: 'badgePositive',
};

const SEVERITY_STYLE: Record<Severity, string> = {
  high: 'severityHigh',
  medium: 'severityMedium',
  low: 'severityLow',
};

const BAR_STYLE: Record<PatternType, string> = {
  error: 'barError',
  'anti-pattern': 'barAntiPattern',
  style: 'barStyle',
  positive: 'barPositive',
};

export default function KomodoMemoryPage() {
  const [store, setStore] = useState<MemoryStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<PatternType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchMemory = useCallback(async () => {
    try {
      const res = await fetch('/api/komodo/memory');
      const data: MemoryStore = await res.json();
      setStore(data);
    } catch {
      setStore({ patterns: [], reviewOutcomes: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const filteredPatterns = useMemo(() => {
    if (!store) return [];
    let result = [...store.patterns];
    if (filterType !== 'all') {
      result = result.filter((p) => p.type === filterType);
    }
    if (filterSeverity !== 'all') {
      result = result.filter((p) => p.severity === filterSeverity);
    }
    result.sort((a, b) => b.frequency - a.frequency);
    return result;
  }, [store, filterType, filterSeverity]);

  const top10 = useMemo(() => {
    if (!store) return [];
    return [...store.patterns]
      .filter((p) => p.type === 'error' || p.type === 'anti-pattern')
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }, [store]);

  const stats = useMemo(() => {
    if (!store) return null;
    const outcomes = store.reviewOutcomes;
    const totalReviews = outcomes.length;
    if (totalReviews === 0) {
      return { totalReviews: 0, passed: 0, failed: 0, passRate: 0, avgCycles: 0, trend: null };
    }
    const passed = outcomes.filter((r) => r.outcome === 'passed').length;
    const failed = outcomes.filter((r) => r.outcome === 'failed').length;
    const passRate = Math.round((passed / totalReviews) * 100);
    const totalCycles = outcomes.reduce((sum, r) => sum + (r.cycles || 1), 0);
    const avgCycles = Math.round((totalCycles / totalReviews) * 10) / 10;

    let trend: 'improving' | 'stable' | 'worsening' | null = null;
    if (outcomes.length >= 4) {
      const mid = Math.floor(outcomes.length / 2);
      const firstHalf = outcomes.slice(0, mid);
      const secondHalf = outcomes.slice(mid);
      const avgFirst = firstHalf.reduce((s, r) => s + r.cycles, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, r) => s + r.cycles, 0) / secondHalf.length;
      if (avgSecond < avgFirst - 0.2) trend = 'improving';
      else if (avgSecond > avgFirst + 0.2) trend = 'worsening';
      else trend = 'stable';
    }

    return { totalReviews, passed, failed, passRate, avgCycles, trend };
  }, [store]);

  const patternCounts = useMemo(() => {
    if (!store) return { error: 0, 'anti-pattern': 0, style: 0, positive: 0 };
    const counts: Record<string, number> = { error: 0, 'anti-pattern': 0, style: 0, positive: 0 };
    store.patterns.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, [store]);

  async function handleClear() {
    setClearing(true);
    try {
      const res = await fetch('/api/komodo/memory/clear', { method: 'DELETE' });
      if (res.ok) {
        setStore({ patterns: [], reviewOutcomes: [] });
      }
    } catch {
      // silently fail
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Memory</h1>
        <p className={styles.muted}>Loading patterns...</p>
      </div>
    );
  }

  const maxFreq = top10.length > 0 ? top10[0].frequency : 1;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Memory</h1>
        {showClearConfirm ? (
          <div className={styles.clearConfirm}>
            <span className={styles.clearLabel}>Clear all memory?</span>
            <button onClick={handleClear} disabled={clearing} className={styles.btnDanger}>
              {clearing ? 'Clearing...' : 'Confirm'}
            </button>
            <button onClick={() => setShowClearConfirm(false)} className={styles.btnSecondary}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowClearConfirm(true)} className={styles.btnClear}>
            Clear Memory
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Total Patterns</h3>
            <p className={styles.statValue}>{store?.patterns.length ?? 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Total Reviews</h3>
            <p className={styles.statValue}>{stats.totalReviews}</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Avg Review Cycles</h3>
            <p className={styles.statValue}>{stats.avgCycles || '—'}</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Trend</h3>
            <p className={styles.statValue}>
              {stats.trend === 'improving' && <span className={styles.trendImproving}>Improving</span>}
              {stats.trend === 'worsening' && <span className={styles.trendWorsening}>Worsening</span>}
              {stats.trend === 'stable' && <span className={styles.trendStable}>Stable</span>}
              {stats.trend === null && <span className={styles.trendNone}>—</span>}
            </p>
          </div>
        </section>
      )}

      {/* Pattern Type Distribution */}
      <section className={styles.statsGrid}>
        {(Object.keys(TYPE_LABELS) as PatternType[]).map((type) => (
          <div key={type} className={styles.statCard}>
            <h3 className={styles.statLabel}>{TYPE_LABELS[type]}</h3>
            <p className={styles.statValue}>{patternCounts[type]}</p>
          </div>
        ))}
      </section>

      {/* Top 10 Bar Chart */}
      {top10.length > 0 && (
        <section className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Top 10 Most Frequent Issues</h2>
          <div className={styles.chartList}>
            {top10.map((pattern) => (
              <div key={pattern.id} className={styles.barRow}>
                <div className={styles.barMeta}>
                  <span className={styles.barDesc} title={pattern.description}>
                    {pattern.description.length > 80
                      ? pattern.description.slice(0, 80) + '...'
                      : pattern.description}
                  </span>
                  <span className={styles.barFreq}>x{pattern.frequency}</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles[BAR_STYLE[pattern.type]]}`}
                    style={{ width: `${(pattern.frequency / maxFreq) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PatternType | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            {(Object.keys(TYPE_LABELS) as PatternType[]).map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <span className={styles.filterCount}>
          {filteredPatterns.length} pattern{filteredPatterns.length !== 1 ? 's' : ''}
        </span>
      </section>

      {/* Patterns Table */}
      {filteredPatterns.length === 0 ? (
        <p className={styles.muted}>No patterns found.</p>
      ) : (
        <section className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Severity</th>
                <th className={styles.th}>Freq</th>
                <th className={styles.th}>Last Seen</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filteredPatterns.map((pattern) => (
                <PatternRow key={pattern.id} pattern={pattern} />
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function PatternRow({ pattern }: { pattern: Pattern }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={styles.tbodyRow} onClick={() => setExpanded(!expanded)}>
        <td className={styles.tdDesc}>
          <span className={styles.expandIcon}>{expanded ? '▾' : '▸'}</span>
          {pattern.description.length > 100
            ? pattern.description.slice(0, 100) + '...'
            : pattern.description}
        </td>
        <td className={styles.td}>
          <span className={`${styles.badge} ${styles[TYPE_BADGE[pattern.type]]}`}>
            {TYPE_LABELS[pattern.type]}
          </span>
        </td>
        <td className={styles.td}>
          <span className={`${styles.badge} ${styles[SEVERITY_STYLE[pattern.severity]]}`}>
            {pattern.severity}
          </span>
        </td>
        <td className={styles.tdFreq}>x{pattern.frequency}</td>
        <td className={styles.tdDate}>{pattern.lastSeen}</td>
      </tr>
      {expanded && (
        <tr className={styles.expandedRow}>
          <td colSpan={5} className={styles.expandedCell}>
            <div className={styles.expandedContent}>
              <p className={styles.expandedDesc}>{pattern.description}</p>
              {pattern.resolution && (
                <p className={styles.expandedResolution}>
                  <span className={styles.resolutionLabel}>Resolution: </span>
                  {pattern.resolution}
                </p>
              )}
              <div className={styles.tagList}>
                {pattern.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              <p className={styles.expandedMeta}>
                First seen: {pattern.firstSeen}
                {pattern.prNumber && <> &middot; PR #{pattern.prNumber}</>}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
