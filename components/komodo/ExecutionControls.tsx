'use client';

import { useState } from 'react';
import type { ExecutionState } from '@/lib/komodo/types';
import styles from './ExecutionControls.module.css';

interface ExecutionControlsProps {
  executionState: ExecutionState;
  phase: string;
  connected: boolean;
  onPause: () => void;
  onStop: () => void;
}

const STATE_CONFIG: Record<ExecutionState, { label: string; dotClass: string; badgeClass: string }> = {
  running: { label: 'Running', dotClass: styles.dotRunning, badgeClass: styles.badgeRunning },
  paused: { label: 'Paused', dotClass: styles.dotPaused, badgeClass: styles.badgePaused },
  stopped: { label: 'Stopped', dotClass: styles.dotStopped, badgeClass: styles.badgeStopped },
};

export function ExecutionControls({
  executionState,
  phase,
  connected,
  onPause,
  onStop,
}: ExecutionControlsProps) {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const state = executionState ?? 'stopped';
  const config = STATE_CONFIG[state];
  const isRunning = state === 'running';
  const isPaused = state === 'paused';
  const hasTaskInProgress = phase !== 'idle';

  function handleStop() {
    if (hasTaskInProgress && !showStopConfirm) {
      setShowStopConfirm(true);
      return;
    }
    setShowStopConfirm(false);
    onStop();
  }

  function handleCancelStop() {
    setShowStopConfirm(false);
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Execution</h2>
          <span className={`${styles.badge} ${config.badgeClass}`}>
            <span className={`${styles.dot} ${config.dotClass}`} />
            {config.label}
          </span>
        </div>

        <div className={styles.controls}>
          {isRunning && (
            <button
              onClick={onPause}
              disabled={!connected}
              className={`${styles.btnBase} ${styles.btnPause}`}
              title="Pause after current task completes"
            >
              <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </button>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={handleStop}
              disabled={!connected}
              className={`${styles.btnBase} ${styles.btnStop}`}
              title="Stop immediately"
            >
              <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          )}
        </div>
      </div>

      {showStopConfirm && (
        <div className={styles.confirmBox}>
          <p className={styles.confirmText}>
            A task is currently in progress. Stopping now will interrupt it. Are you sure?
          </p>
          <div className={styles.confirmActions}>
            <button
              onClick={handleStop}
              className={`${styles.btnBase} ${styles.btnConfirm}`}
            >
              Confirm Stop
            </button>
            <button
              onClick={handleCancelStop}
              className={`${styles.btnBase} ${styles.btnCancel}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isPaused && (
        <div className={styles.pausedBanner}>
          <p className={styles.pausedText}>
            Orchestrator will pause after the current task completes.
          </p>
        </div>
      )}
    </section>
  );
}
